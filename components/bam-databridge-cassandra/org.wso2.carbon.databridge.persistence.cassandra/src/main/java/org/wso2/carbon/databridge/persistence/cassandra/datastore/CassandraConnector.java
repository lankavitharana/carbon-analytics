/*
 * Copyright 2012 WSO2, Inc. (http://wso2.com)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.wso2.carbon.databridge.persistence.cassandra.datastore;

import me.prettyprint.cassandra.model.BasicColumnDefinition;
import me.prettyprint.cassandra.model.BasicColumnFamilyDefinition;
import me.prettyprint.cassandra.serializers.*;
import me.prettyprint.cassandra.service.ThriftCfDef;
import me.prettyprint.hector.api.Cluster;
import me.prettyprint.hector.api.Keyspace;
import me.prettyprint.hector.api.Serializer;
import me.prettyprint.hector.api.beans.*;
import me.prettyprint.hector.api.ddl.*;
import me.prettyprint.hector.api.exceptions.HectorException;
import me.prettyprint.hector.api.factory.HFactory;
import me.prettyprint.hector.api.mutation.Mutator;
import me.prettyprint.hector.api.query.QueryResult;
import me.prettyprint.hector.api.query.RangeSlicesQuery;
import org.apache.axis2.engine.AxisConfiguration;
import org.apache.commons.io.IOUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.wso2.carbon.context.PrivilegedCarbonContext;
import org.wso2.carbon.databridge.commons.*;
import org.wso2.carbon.databridge.commons.utils.DataBridgeCommonsUtils;
import org.wso2.carbon.databridge.core.exception.StreamDefinitionStoreException;
import org.wso2.carbon.databridge.persistence.cassandra.Utils.AttributeValue;
import org.wso2.carbon.databridge.persistence.cassandra.Utils.CassandraSDSUtils;
import org.wso2.carbon.databridge.persistence.cassandra.Utils.StreamDefinitionUtils;
import org.wso2.carbon.databridge.persistence.cassandra.caches.CFCache;
import org.wso2.carbon.databridge.persistence.cassandra.inserter.*;
import org.wso2.carbon.databridge.persistence.cassandra.internal.util.AppendUtils;
import org.wso2.carbon.databridge.persistence.cassandra.internal.util.ServiceHolder;
import org.wso2.carbon.utils.CarbonUtils;
import org.wso2.carbon.utils.multitenancy.MultitenantUtils;

import java.io.File;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Cassandra backend connector  and related operations
 */
public class CassandraConnector {

    private static final String STREAM_NAME_KEY = "Name";


    private static final String STREAM_VERSION_KEY = "Version";
    private static final String STREAM_NICK_NAME_KEY = "Nick_Name";
    private static final String STREAM_TIMESTAMP_KEY = "Timestamp";
    private static final String STREAM_DESCRIPTION_KEY = "Description";

    private static final String STREAM_ID_KEY = "StreamId";
    public static final String BAM_META_STREAM_DEF_CF = "STREAM_DEFINITION";

//    public static final String BAM_META_KEYSPACE = "META_KS";


    public static final String BAM_EVENT_DATA_KEYSPACE = "EVENT_KS";

    private volatile AtomicInteger eventCounter = new AtomicInteger();

    private volatile AtomicLong totalEventCounter = new AtomicLong();

    private static final String STREAM_DEF = "STREAM_DEFINITION";

    private final static StringSerializer stringSerializer = StringSerializer.get();
    private final static LongSerializer longSerializer = LongSerializer.get();
    private final static BooleanSerializer booleanSerializer = BooleanSerializer.get();
    private final static DoubleSerializer doubleSerializer = DoubleSerializer.get();
    private final static DynamicCompositeSerializer dynamicCompositeSerializer = DynamicCompositeSerializer.get();

    private AtomicInteger rowkeyCounter = new AtomicInteger();
    private volatile AtomicInteger indexKeyCounter = new AtomicInteger();

    private volatile AtomicLong lastAccessedMilli = new AtomicLong();

    static Log log = LogFactory.getLog(CassandraConnector.class);

    private Map<AttributeType, TypeInserter> inserterMap = new ConcurrentHashMap<AttributeType, TypeInserter>();

    // Map to hold Cassandra comparator class names for each attribute type
    private static Map<AttributeType, String> attributeComparatorMap =
            new HashMap<AttributeType, String>();

    private static final String COMPARATOR_BOOL_TYPE = "org.apache.cassandra.db.marshal.BooleanType";
    private static final String COMPARATOR_DOUBLE_TYPE = "org.apache.cassandra.db.marshal.DoubleType";
    private static final String COMPARATOR_FLOAT_TYPE = "org.apache.cassandra.db.marshal.FloatType";

    private int port = 0;
    private String localAddress = null;
    private long startTime;

    private boolean IS_PERFORMANCE_MEASURED = false;

    public static final String EVENT_INDEX_CF_PREFIX = "event_index_";
    public static final String EVENT_INDEX_ROWS_COL_VAL = "null";
    public static final String EVENT_INDEX_ROWS_KEY = "INDEX_ROW";

    //Indexing Related
    public static final String SEC_INDEX_COLUMN_SUFFIX = "_index";
    private static final String SECONDARY_INDEX_DEF = "SECONDARY_INDEXES";
    private static final String CUSTOM_INDEX_DEF = "CUSTOM_INDEXES";
    private static final String INCREMENTAL_INDEX = "INCREMENTAL_INDEX";
    private static final String FIXED_SEARCH_DEF = "FIXED_SEARCH_PROPERTIES";
    private static final String CUSTOM_INDEX_ROWS_KEY = "INDEX_ROW";
    private static final String CUSTOM_INDEX_VALUE_ROW_KEY = "INDEX_VALUE_ROW";
    private static final String ARBITRARY_INDEX_DEF = "ARBITRARY_INDEXES";

    //Global Activity ID Index
    private static final String BAM_ACTIVITY_ID = "activity_id";
    public static final String GLOBAL_ACTIVITY_MONITORING_INDEX_CF = "global_index_activity_monitoring";

    private ConcurrentHashMap<String, Long> indexCFLastAddedTimeStampCache =
            new ConcurrentHashMap<String, Long>();

    private ConcurrentHashMap<String, String> streamInitializationCache =
            new ConcurrentHashMap<String, String>();

    static {
        attributeComparatorMap.put(AttributeType.STRING, ComparatorType.UTF8TYPE.getClassName());
        attributeComparatorMap.put(AttributeType.INT, ComparatorType.INTEGERTYPE.getClassName());
        attributeComparatorMap.put(AttributeType.LONG, ComparatorType.LONGTYPE.getClassName());
        attributeComparatorMap.put(AttributeType.FLOAT, COMPARATOR_FLOAT_TYPE);
        attributeComparatorMap.put(AttributeType.DOUBLE, COMPARATOR_DOUBLE_TYPE);
        attributeComparatorMap.put(AttributeType.BOOL, COMPARATOR_BOOL_TYPE);
    }


    public CassandraConnector() {

        if (System.getProperty("profile.receiver") != null) {
            IS_PERFORMANCE_MEASURED = System.getProperty("profile.receiver").equals("true");
        }
        try {
            AxisConfiguration axisConfiguration =
                    ServiceHolder.getConfigurationContextService().getServerConfigContext().getAxisConfiguration();

            String portOffset = CarbonUtils.getServerConfiguration().
                    getFirstProperty("Ports.Offset");
            port = CarbonUtils.getTransportPort(axisConfiguration, "https") +
                    Integer.parseInt(portOffset);

            localAddress = StreamDefinitionUtils.getLocalAddress().getHostAddress();
        } catch (Exception e) {
            if (log.isDebugEnabled()) {
                log.warn("Error when detecting Host/Port, using defaults");
            }
            localAddress = (localAddress == null) ? "127.0.0.1" : localAddress;
            port = (port == 0) ? 9443 : port;
        }

        createInserterMap();

    }

    void commit(Mutator mutator) throws StreamDefinitionStoreException {
        mutator.execute();
    }

    private void createInserterMap() {
        inserterMap.put(AttributeType.INT, new IntInserter());
        inserterMap.put(AttributeType.BOOL, new BoolInserter());
        inserterMap.put(AttributeType.LONG, new LongInserter());
        inserterMap.put(AttributeType.FLOAT, new FloatInserter());
        inserterMap.put(AttributeType.STRING, new StringInserter());
        inserterMap.put(AttributeType.DOUBLE, new DoubleInserter());
    }

    public ColumnFamilyDefinition getColumnFamily(Cluster cluster, String keyspaceName,
                                                  String columnFamilyName) {

        Keyspace keyspace = getKeyspace(keyspaceName, cluster);
        KeyspaceDefinition keyspaceDef =
                cluster.describeKeyspace(keyspace.getKeyspaceName());
        List<ColumnFamilyDefinition> cfDef = keyspaceDef.getCfDefs();
        for (ColumnFamilyDefinition cfdef : cfDef) {
            if (cfdef.getName().equals(columnFamilyName)) {
                return cfdef;
            }
        }

        return null;
    }

    public ColumnFamilyDefinition createColumnFamily(Cluster cluster, String keyspaceName,
                                                     String columnFamilyName,
                                                     StreamDefinition streamDefinition) {
        Keyspace keyspace = getKeyspace(keyspaceName, cluster);
        KeyspaceDefinition keyspaceDef =
                cluster.describeKeyspace(keyspace.getKeyspaceName());
        List<ColumnFamilyDefinition> cfDef = keyspaceDef.getCfDefs();
        for (ColumnFamilyDefinition cfdef : cfDef) {
            if (cfdef.getName().equals(columnFamilyName)) {
                if (log.isDebugEnabled()) {
                    log.debug("Column Family " + columnFamilyName + " already exists.");
                }
                CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);
                return cfdef;
            }
        }

        ColumnFamilyDefinition columnFamilyDefinition = new BasicColumnFamilyDefinition();
        columnFamilyDefinition.setKeyspaceName(keyspaceName);
        columnFamilyDefinition.setName(columnFamilyName);
        columnFamilyDefinition.setKeyValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.setComparatorType(ComparatorType.UTF8TYPE);

        Map<String, String> compressionOptions = new HashMap<String, String>();
        compressionOptions.put("sstable_compression", "SnappyCompressor");
        compressionOptions.put("chunk_length_kb", "128");
        columnFamilyDefinition.setCompressionOptions(compressionOptions);

        addMetaColumnDefinitionsToColumnFamily(columnFamilyDefinition);

        if (streamDefinition != null) {
            addColumnDefinitionsToColumnFamily(streamDefinition.getPayloadData(),
                    DataType.payload, columnFamilyDefinition);
            addColumnDefinitionsToColumnFamily(streamDefinition.getMetaData(),
                    DataType.meta, columnFamilyDefinition);
            addColumnDefinitionsToColumnFamily(streamDefinition.getCorrelationData(),
                    DataType.correlation, columnFamilyDefinition);
        }

        try {
            cluster.addColumnFamily(new ThriftCfDef(columnFamilyDefinition), true);
        } catch (me.prettyprint.hector.api.exceptions.HInvalidRequestException e) {
            // checking for inevitable, harmless exception in clustered environments (sorry)
            if (e.getMessage().contains("Cannot add already existing column family")) {
                if (log.isDebugEnabled()) {
                    log.debug(e.getMessage());
                }
            } else {
                throw e;
            }
        }

        CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);

        return columnFamilyDefinition;
    }

    public void createSecondaryIndexes(Cluster cluster, ColumnFamilyDefinition cfDef,
                                       StreamDefinition streamDefinition) {
        List<Attribute> secondaryIndexList = streamDefinition.getIndexDefinition().getSecondaryIndexData();

        BasicColumnFamilyDefinition columnFamilyDefinition = new BasicColumnFamilyDefinition(cfDef);

        for (Attribute attribute : secondaryIndexList) {
            BasicColumnDefinition columnDefinition = new BasicColumnDefinition();
            columnDefinition.setName(StringSerializer.get().toByteBuffer(attribute.getName()));
            columnDefinition.setIndexName(CassandraSDSUtils.getSecondaryIndexColumnName(attribute.getName()));
            columnDefinition.setIndexType(ColumnIndexType.KEYS);
            columnDefinition.setValidationClass(attributeComparatorMap.get(attribute.getType()));
            columnFamilyDefinition.addColumnDefinition(columnDefinition);
        }

        //todo : proper exception handling
        try {
            cluster.updateColumnFamily(new ThriftCfDef(columnFamilyDefinition));
        } catch (HectorException e) {
            log.warn("Secondary Index creation is not successful... " + e);
        }

    }

    public void createCustomIndexes(Cluster cluster, ColumnFamilyDefinition cfDef,
                                    StreamDefinition streamDefinition,
                                    String primaryColumnFamilyName) {
        List<Attribute> customIndexList = streamDefinition.getIndexDefinition().getCustomIndexData();

        for (Attribute attribute : customIndexList) {
            ColumnFamilyDefinition indexCfDef = createCustomIndexColumnFamily(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
                    CassandraSDSUtils.getCustomIndexCFName(primaryColumnFamilyName, attribute.getName()), attribute.getType());
        }

    }

    public void createArbitraryCustomIndexes(Cluster cluster, ColumnFamilyDefinition cfDef,
                                             StreamDefinition streamDefinition,
                                             String primaryColumnFamilyName) {
        List<Attribute> arbitraryIndexList = streamDefinition.getIndexDefinition().getArbitraryIndexData();

        for (Attribute attribute : arbitraryIndexList) {
            ColumnFamilyDefinition indexCfDef = createCustomIndexColumnFamily(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
                    CassandraSDSUtils.getCustomIndexCFName(primaryColumnFamilyName, attribute.getName()), attribute.getType());
        }

    }

    public void invalidateStreamCache(String streamId) {
        streamInitializationCache.put(streamId, Boolean.FALSE.toString());
    }

    private ColumnFamilyDefinition createIndexColumnFamily(Cluster cluster, String keyspaceName,
                                                           String columnFamilyName) {
        Keyspace keyspace = getKeyspace(keyspaceName, cluster);
        KeyspaceDefinition keyspaceDef =
                cluster.describeKeyspace(keyspace.getKeyspaceName());
        List<ColumnFamilyDefinition> cfDef = keyspaceDef.getCfDefs();
        for (ColumnFamilyDefinition cfdef : cfDef) {
            if (cfdef.getName().equals(columnFamilyName)) {
                if (log.isDebugEnabled()) {
                    log.debug("Column Family " + columnFamilyName + " already exists.");
                }
                CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);
                return cfdef;
            }
        }
        ColumnFamilyDefinition columnFamilyDefinition = new BasicColumnFamilyDefinition();
        columnFamilyDefinition.setKeyspaceName(keyspaceName);
        columnFamilyDefinition.setName(columnFamilyName);
        columnFamilyDefinition.setKeyValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.setComparatorType(ComparatorType.LONGTYPE);

        Map<String, String> compressionOptions = new HashMap<String, String>();
        compressionOptions.put("sstable_compression", "SnappyCompressor");
        compressionOptions.put("chunk_length_kb", "128");
        columnFamilyDefinition.setCompressionOptions(compressionOptions);

//        addMetaColumnDefinitionsToColumnFamily(columnFamilyDefinition);

        try {
            cluster.addColumnFamily(new ThriftCfDef(columnFamilyDefinition), true);
        } catch (me.prettyprint.hector.api.exceptions.HInvalidRequestException e) {
            // checking for inevitable, harmless exception in clustered environments (sorry)
            if (e.getMessage().contains("Cannot add already existing column family")) {
                if (log.isDebugEnabled()) {
                    log.debug(e.getMessage());
                }
            } else {
                throw e;
            }
        }

        CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);

        return columnFamilyDefinition;
    }

    private ColumnFamilyDefinition createGlobalActivityIndexColumnFamily(Cluster cluster,
                                                                         String keyspaceName,
                                                                         String columnFamilyName) {
        Keyspace keyspace = getKeyspace(keyspaceName, cluster);
        KeyspaceDefinition keyspaceDef =
                cluster.describeKeyspace(keyspace.getKeyspaceName());
        List<ColumnFamilyDefinition> cfDef = keyspaceDef.getCfDefs();
        for (ColumnFamilyDefinition cfdef : cfDef) {
            if (cfdef.getName().equals(columnFamilyName)) {
                if (log.isDebugEnabled()) {
                    log.debug("Column Family " + columnFamilyName + " already exists.");
                }
                CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);
                return cfdef;
            }
        }
        ColumnFamilyDefinition columnFamilyDefinition = new BasicColumnFamilyDefinition();
        columnFamilyDefinition.setKeyspaceName(keyspaceName);
        columnFamilyDefinition.setName(columnFamilyName);
        columnFamilyDefinition.setKeyValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.setComparatorType(ComparatorType.UTF8TYPE);

        Map<String, String> compressionOptions = new HashMap<String, String>();
        compressionOptions.put("sstable_compression", "SnappyCompressor");
        compressionOptions.put("chunk_length_kb", "128");
        columnFamilyDefinition.setCompressionOptions(compressionOptions);

        try {
            cluster.addColumnFamily(new ThriftCfDef(columnFamilyDefinition), true);
        } catch (me.prettyprint.hector.api.exceptions.HInvalidRequestException e) {
            // checking for inevitable, harmless exception in clustered environments (sorry)
            if (e.getMessage().contains("Cannot add already existing column family")) {
                if (log.isDebugEnabled()) {
                    log.debug(e.getMessage());
                }
            } else {
                throw e;
            }
        }

        CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);

        return columnFamilyDefinition;
    }

    private ColumnFamilyDefinition createCustomIndexColumnFamily(Cluster cluster,
                                                                 String keyspaceName,
                                                                 String columnFamilyName,
                                                                 AttributeType attributeType) {
        Keyspace keyspace = getKeyspace(keyspaceName, cluster);
        KeyspaceDefinition keyspaceDef =
                cluster.describeKeyspace(keyspace.getKeyspaceName());
        List<ColumnFamilyDefinition> cfDef = keyspaceDef.getCfDefs();
        for (ColumnFamilyDefinition cfdef : cfDef) {
            if (cfdef.getName().equals(columnFamilyName)) {
                if (log.isDebugEnabled()) {
                    log.debug("Column Family " + columnFamilyName + " already exists.");
                }
                CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);
                return cfdef;
            }
        }
        ColumnFamilyDefinition columnFamilyDefinition = new BasicColumnFamilyDefinition();
        columnFamilyDefinition.setKeyspaceName(keyspaceName);
        columnFamilyDefinition.setName(columnFamilyName);
        columnFamilyDefinition.setKeyValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.setComparatorType(ComparatorType.DYNAMICCOMPOSITETYPE);
        columnFamilyDefinition.setComparatorTypeAlias(DynamicComposite.DEFAULT_DYNAMIC_COMPOSITE_ALIASES);

        Map<String, String> compressionOptions = new HashMap<String, String>();
        compressionOptions.put("sstable_compression", "SnappyCompressor");
        compressionOptions.put("chunk_length_kb", "128");
        columnFamilyDefinition.setCompressionOptions(compressionOptions);

        try {
            cluster.addColumnFamily(new ThriftCfDef(columnFamilyDefinition), true);
        } catch (me.prettyprint.hector.api.exceptions.HInvalidRequestException e) {
            // checking for inevitable, harmless exception in clustered environments (sorry)
            if (e.getMessage().contains("Cannot add already existing column family")) {
                if (log.isDebugEnabled()) {
                    log.debug(e.getMessage());
                }
            } else {
                throw e;
            }
        }

        CFCache.putCF(cluster, keyspaceName, columnFamilyName, true);

        return columnFamilyDefinition;
    }

    public boolean createKeySpaceIfNotExisting(Cluster cluster, String keySpaceName) {
        KeyspaceDefinition keySpaceDef = cluster.describeKeyspace(keySpaceName);
        if (keySpaceDef == null) {
            synchronized (this) {
                keySpaceDef = cluster.describeKeyspace(keySpaceName);
                if (keySpaceDef == null) {
                    cluster.addKeyspace(HFactory.createKeyspaceDefinition(
                            keySpaceName, StreamDefinitionUtils.getStrategyClass(),
                            StreamDefinitionUtils.getReplicationFactor(), null), true);
                    return true;
                } else {
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    public List<String> insertEventList(Credentials credentials, Cluster cluster,
                                        List<Event> eventList)
            throws StreamDefinitionStoreException {
        StreamDefinition streamDef;

        Mutator<String> mutator = getMutator(cluster);
        Mutator<String> eventIndexMutator = getMutator(cluster, StreamDefinitionUtils.getIndexKeySpaceName());

        List<String> rowKeyList = new ArrayList<String>();
        startTimeMeasurement(IS_PERFORMANCE_MEASURED);

        Map<String, Attribute> metaIndex = null;
        Map<String, Attribute> payloadIndex = null;
        Map<String, Attribute> correlationIndex = null;
        Map<String, Attribute> generalIndex = null;
        Map<String, Attribute> fixedIndexProperties = null;
        Map<String, AttributeValue> fixedIndexPropertyValueMap = null;
        Map<String, Attribute> arbitraryIndex = null;
        boolean isIncrementalIndex = false;
        boolean isTimeStampIndex = false;

        for (Event event : eventList) {

            String rowKey;
            streamDef = getStreamDefinitionFromStore(event.getStreamId());

            if (!Boolean.parseBoolean(streamInitializationCache.get(event.getStreamId()))) {
                synchronized (this) {
                    if (!Boolean.parseBoolean(streamInitializationCache.get(event.getStreamId()))) {
                        createColumnFamilyForStream(cluster, streamDef);
                    }
                }
            }

            if (streamDef == null) {
                return null;
            }

            if (streamDef.getIndexDefinition() != null) {
                IndexDefinition indexDefinition = streamDef.getIndexDefinition();
                metaIndex = indexDefinition.getMetaCustomIndex();
                payloadIndex = indexDefinition.getPayloadCustomIndex();
                correlationIndex = indexDefinition.getCorrelationCustomIndex();
                generalIndex = indexDefinition.getGeneralCustomIndex();
                fixedIndexProperties = indexDefinition.getFixedPropertiesMap();
                isIncrementalIndex = indexDefinition.isIncrementalIndex();
                isTimeStampIndex = streamDef.getIndexDefinition().isIndexTimestamp();
                arbitraryIndex = indexDefinition.getArbitraryIndex();
                fixedIndexPropertyValueMap = new LinkedHashMap<String, AttributeValue>();
            }

            String streamColumnFamily = CassandraSDSUtils.convertStreamNameToCFName(
                    streamDef.getName());
            if ((streamDef == null) || (streamColumnFamily == null)) {
                String errorMsg = "Event stream definition or column family cannot be null";
                log.error(errorMsg);
                throw new StreamDefinitionStoreException(errorMsg);
            }


            if (log.isTraceEnabled()) {
                KeyspaceDefinition keyspaceDefinition = cluster.describeKeyspace(StreamDefinitionUtils.getKeySpaceName());
                log.trace("Keyspace desc. : " + keyspaceDefinition);

                String CFInfo = "CFs present \n";
                for (ColumnFamilyDefinition columnFamilyDefinition : keyspaceDefinition.getCfDefs()) {
                    CFInfo += "cf name : " + columnFamilyDefinition.getName() + "\n";
                }
                log.trace(CFInfo);
            }


            eventCounter.incrementAndGet();


            // / add  current server time as time stamp if time stamp is not set
            long timestamp;
            if (event.getTimeStamp() != 0L) {
                timestamp = event.getTimeStamp();
            } else {
                timestamp = System.currentTimeMillis();
            }


            rowKey = CassandraSDSUtils.createRowKey(timestamp, localAddress, port, rowkeyCounter.incrementAndGet());

            String streamDefDescription = streamDef.getDescription();
            String streamDefNickName = streamDef.getNickName();

            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createStringColumn(STREAM_ID_KEY, streamDef.getStreamId()));
            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createStringColumn(STREAM_NAME_KEY, streamDef.getName()));
            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createStringColumn(STREAM_VERSION_KEY, streamDef.getVersion()));

            if (streamDefDescription != null) {
                mutator.addInsertion(rowKey, streamColumnFamily,
                        HFactory.createStringColumn(STREAM_DESCRIPTION_KEY, streamDefDescription));
            }
            if (streamDefNickName != null) {
                mutator.addInsertion(rowKey, streamColumnFamily,
                        HFactory.createStringColumn(STREAM_NICK_NAME_KEY, streamDefNickName));
            }

            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createColumn(STREAM_TIMESTAMP_KEY, timestamp, stringSerializer,
                            longSerializer)
            );

            if (event.getArbitraryDataMap() != null) {
                if (arbitraryIndex == null) {
                    this.insertVariableFields(streamColumnFamily, rowKey, mutator, event.getArbitraryDataMap());
                } else {
                    this.insertVariableFieldsWithIndexing(streamColumnFamily, rowKey, mutator, event.getArbitraryDataMap(),
                            eventIndexMutator, arbitraryIndex, timestamp, fixedIndexPropertyValueMap);
                }
            }

            //todo : come up with a better solution for this
            if (fixedIndexProperties != null && !fixedIndexProperties.isEmpty()) {
                fillIndexPropValueMap(fixedIndexPropertyValueMap,
                        event.getMetaData(), event.getCorrelationData(), event.getPayloadData(), streamDef);
            }

            if (isTimeStampIndex) {
                addIndexColumn(generalIndex.get(STREAM_TIMESTAMP_KEY), timestamp, streamColumnFamily, rowKey, timestamp,
                        fixedIndexPropertyValueMap, eventIndexMutator);

            }

            if (streamDef.getMetaData() != null) {
                if (metaIndex == null) {
                    prepareDataForInsertion(event.getMetaData(), streamDef.getMetaData(), DataType.meta, rowKey,
                            streamColumnFamily, mutator);
                } else {
                    prepareDataForInsertionWithIndexing(event.getMetaData(), streamDef.getMetaData(), DataType.meta, rowKey,
                            streamColumnFamily, mutator, eventIndexMutator,
                            metaIndex, timestamp, fixedIndexPropertyValueMap);
                }

            }
            //Iterate for correlation  data
            if (event.getCorrelationData() != null) {
                if (correlationIndex == null) {
                    prepareCorrelationDataForInsertion(event.getCorrelationData(), streamDef.getCorrelationData(),
                            DataType.correlation, rowKey, streamColumnFamily,
                            mutator, eventIndexMutator, timestamp);
                } else {
                    prepareCorrelationDataForInsertionWithIndexing(event.getCorrelationData(), streamDef.getCorrelationData(),
                            DataType.correlation, rowKey, streamColumnFamily, mutator, eventIndexMutator,
                            correlationIndex, timestamp, fixedIndexPropertyValueMap);
                }
            }

            //Iterate for payload data
            if (event.getPayloadData() != null) {
                if (payloadIndex == null) {
                    prepareDataForInsertion(event.getPayloadData(), streamDef.getPayloadData(), DataType.payload,
                            rowKey, streamColumnFamily, mutator);
                } else {
                    prepareDataForInsertionWithIndexing(event.getPayloadData(), streamDef.getPayloadData(), DataType.payload,
                            rowKey, streamColumnFamily, mutator, eventIndexMutator,
                            payloadIndex, timestamp, fixedIndexPropertyValueMap);
                }
            }

            if (isIncrementalIndex) {
                addTimeStampIndex(rowKey, CassandraSDSUtils
                        .getIndexColumnFamilyName(streamColumnFamily), eventIndexMutator);
            }

            rowKeyList.add(rowKey);

        }

        commit(mutator);
        commit(eventIndexMutator);

        endTimeMeasurement(IS_PERFORMANCE_MEASURED);

        return rowKeyList;

    }

    public void fillIndexPropValueMap(Map<String, AttributeValue> fixedPropertyValues,
                                      Object[] metaData,
                                      Object[] correlationData,
                                      Object[] payloadData,
                                      StreamDefinition streamDefinition) {
        List<Attribute> streamDefnAttrList = null;
        IndexDefinition indexDefinition = streamDefinition.getIndexDefinition();
        Map<String, AttributeValue> tempValueMap = new HashMap<String, AttributeValue>();

        Set<String> metaFix = indexDefinition.getMetaFixProps();
        Set<String> correlationFix = indexDefinition.getCorrelationFixProps();
        Set<String> payloadFix = indexDefinition.getPayloadFixProps();

        if (metaFix != null) {
            for (String property : metaFix) {
                streamDefnAttrList = streamDefinition.getMetaData();
                for (int i = 0; i < streamDefnAttrList.size(); i++) {
                    Attribute attribute = streamDefnAttrList.get(i);
                    String attributeName = attribute.getName();
                    if (property.equals(attributeName)) {
                        tempValueMap.put(attributeName, new AttributeValue(metaData[i], attribute));
                        break;
                    }
                }
            }
        }

        if (correlationFix != null) {
            for (String property : correlationFix) {
                streamDefnAttrList = streamDefinition.getCorrelationData();
                for (int i = 0; i < streamDefnAttrList.size(); i++) {
                    Attribute attribute = streamDefnAttrList.get(i);
                    String attributeName = attribute.getName();
                    if (property.equals(attributeName)) {
                        tempValueMap.put(attributeName, new AttributeValue(correlationData[i], attribute));
                        break;
                    }
                }
            }
        }

        if (payloadFix != null) {
            for (String property : payloadFix) {
                streamDefnAttrList = streamDefinition.getPayloadData();
                for (int i = 0; i < streamDefnAttrList.size(); i++) {
                    Attribute attribute = streamDefnAttrList.get(i);
                    String attributeName = attribute.getName();
                    if (property.equals(attributeName)) {
                        tempValueMap.put(attributeName, new AttributeValue(payloadData[i], attribute));
                        break;
                    }
                }
            }
        }

        //Only version can be in general FIX properties
        if (indexDefinition.getGeneralFixProps() != null) {
            tempValueMap.put(STREAM_VERSION_KEY,
                    new AttributeValue(streamDefinition.getVersion(), new Attribute(STREAM_VERSION_KEY, AttributeType.STRING)));
        }

        for (String key : indexDefinition.getFixedPropertiesMap().keySet()) {
            fixedPropertyValues.put(key, tempValueMap.get(key));
        }
    }

    private void addActivityCorrelationIndex(String activityCorrelationRowKey,
                                             String primaryCFRowKey,
                                             String primaryCFName,
                                             Mutator<String> mutator,
                                             long timestamp) {
        String colName = timestamp + ":" + primaryCFRowKey + ":" + primaryCFName;

        mutator.addInsertion(activityCorrelationRowKey, CassandraConnector.GLOBAL_ACTIVITY_MONITORING_INDEX_CF,
                HFactory.createStringColumn(colName, primaryCFRowKey));
    }

    private void addTimeStampIndex(String eventRowKey, String indexCfName,
                                   Mutator<String> mutator) {
        long timestamp;
        String keyStr;

        synchronized (this) {
            timestamp = System.currentTimeMillis();
            if (lastAccessedMilli.get() != timestamp) {
                lastAccessedMilli.set(timestamp);
                indexKeyCounter.set(0);
            }
            keyStr = String.valueOf(timestamp) +
                    String.format("%02d", StreamDefinitionUtils.getNodeId()) +
                    String.format("%02d", indexKeyCounter.incrementAndGet());
        }

        long columnKey = Long.parseLong(keyStr);


        long indexCfRowKey = CassandraSDSUtils.getIndexCFRowKey(timestamp);

        mutator.addInsertion(String.valueOf(indexCfRowKey), indexCfName,
                HFactory.createColumn(columnKey, eventRowKey,
                        longSerializer, stringSerializer)
        );

        Long lastTimeStamp = indexCFLastAddedTimeStampCache.get(indexCfName);

        if (null == lastTimeStamp || lastTimeStamp != indexCfRowKey) {
            mutator.addInsertion(EVENT_INDEX_ROWS_KEY, indexCfName,
                    HFactory.createColumn(indexCfRowKey, String.valueOf(indexCfRowKey), longSerializer, stringSerializer));
            indexCFLastAddedTimeStampCache.put(indexCfName, indexCfRowKey);
        }
    }


    private void endTimeMeasurement(boolean isPerformanceMeasured) {
        if (isPerformanceMeasured) {
            if (eventCounter.get() > 100000) {
                synchronized (this) {
                    if (eventCounter.get() > 100000) {

                        DateFormat dateFormat = new SimpleDateFormat("yyyy/MM/dd HH:mm:ss");
                        Date date = new Date();

                        long endTime = System.currentTimeMillis();
                        int currentBatchSize = eventCounter.getAndSet(0);
                        totalEventCounter.addAndGet(currentBatchSize);

                        String line = "[" + dateFormat.format(date) + "] # of events : " + currentBatchSize +
                                " start timestamp : " + startTime +
                                " end time stamp : " + endTime + " Throughput is (events / sec) : " +
                                (currentBatchSize * 1000) / (endTime - startTime) + " Total Event Count : " +
                                totalEventCounter + " \n";
                        File file = new File(CarbonUtils.getCarbonHome() + File.separator + "receiver-perf.txt");

                        try {
                            AppendUtils.appendToFile(IOUtils.toInputStream(line), file);
                        } catch (IOException e) {
                            log.error(e.getMessage(), e);
                        }

                        startTime = 0;

                    }
                }
            }
        }

    }


    private void startTimeMeasurement(boolean isPerformanceMeasured) {
        if (isPerformanceMeasured) {
            if (startTime == 0) {
                startTime = System.currentTimeMillis();
            }
        }
    }

    private void addColumnDefinitionsToColumnFamily(List<Attribute> attributes, DataType dataType,
                                                    ColumnFamilyDefinition columnFamilyDefinition) {
        if (attributes != null) {
            for (Attribute attribute : attributes) {
                BasicColumnDefinition columnDefinition = new BasicColumnDefinition();
                columnDefinition.setName(stringSerializer.toByteBuffer(
                        CassandraSDSUtils.getColumnName(dataType, attribute)));
                columnDefinition.setValidationClass(attributeComparatorMap.get(
                        attribute.getType()));

                try {
                    columnFamilyDefinition.addColumnDefinition(columnDefinition);
                } catch (UnsupportedOperationException exception) {
                    if (log.isDebugEnabled()) {
                        log.debug("Cannot add the meta information to column family.", exception);
                    }
                }
            }
        }
    }

    private void addFilteredColumnDefinitionsToColumnFamily(
            List<Attribute> attributes, DataType dataType,
            List<ColumnDefinition> columnDefinitions,
            ColumnFamilyDefinition columnFamilyDefinition) {

        List<Attribute> filteredAttributes = new ArrayList<Attribute>();

        if (attributes != null) {
            filteredAttributes.addAll(attributes);

            Iterator<Attribute> attributeIterator = filteredAttributes.iterator();
            while (attributeIterator.hasNext()) {
                Attribute attribute = attributeIterator.next();

                boolean skipAddingMetaData = false; // If the column is already existing skip
                if (columnDefinitions != null) {
                    for (ColumnDefinition columnDefinition : columnDefinitions) {
                        String columnName = stringSerializer.
                                fromByteBuffer(columnDefinition.getName().asReadOnlyBuffer());
                        if (columnName.equals(CassandraSDSUtils.getColumnName(
                                dataType, attribute))) {
                            skipAddingMetaData = true;
                            break;
                        }
                    }

                    if (skipAddingMetaData) {
                        attributeIterator.remove();
                    }
                }
            }

            addColumnDefinitionsToColumnFamily(filteredAttributes, dataType,
                    columnFamilyDefinition);
        }


    }

    private void addMetaColumnDefinitionsToColumnFamily(
            ColumnFamilyDefinition columnFamilyDefinition) {

        BasicColumnDefinition columnDefinition = new BasicColumnDefinition();

        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_ID_KEY));
        columnDefinition.setValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

        columnDefinition = new BasicColumnDefinition();
        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_NAME_KEY));
        columnDefinition.setValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

        columnDefinition = new BasicColumnDefinition();
        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_VERSION_KEY));
        columnDefinition.setValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

        columnDefinition = new BasicColumnDefinition();
        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_DESCRIPTION_KEY));
        columnDefinition.setValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

        columnDefinition = new BasicColumnDefinition();
        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_NICK_NAME_KEY));
        columnDefinition.setValidationClass(ComparatorType.UTF8TYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

        columnDefinition = new BasicColumnDefinition();
        columnDefinition.setName(stringSerializer.toByteBuffer(STREAM_TIMESTAMP_KEY));
        columnDefinition.setValidationClass(ComparatorType.LONGTYPE.getClassName());
        columnFamilyDefinition.addColumnDefinition(columnDefinition);

    }


    public static Credentials getCredentials(Cluster cluster) {
        Map<String, String> credentials = cluster.getCredentials();

        Credentials creds = null;
        for (Map.Entry<String, String> entry : credentials.entrySet()) {
            String userName = entry.getKey();
            String password = entry.getValue();
            String tenantDomain = MultitenantUtils.getTenantDomain(userName);

            creds = new Credentials(userName, password, tenantDomain);
        }

        return creds;
    }


    private void deleteDataFromStreamDefinition(Credentials credentials, Cluster cluster,
                                                String streamId) {
        Keyspace keyspace = getKeyspace(StreamDefinitionUtils.getKeySpaceName(), cluster);

        String CFName = CassandraSDSUtils.convertStreamNameToCFName(
                DataBridgeCommonsUtils.getStreamNameFromStreamId(streamId));

        String deleteVersion = DataBridgeCommonsUtils.getStreamVersionFromStreamId(streamId);

        int row_count = 1000;
        // get all stream ids
        RangeSlicesQuery<String, String, String> query =
                HFactory.createRangeSlicesQuery(keyspace, stringSerializer, stringSerializer, stringSerializer);
        query.setColumnFamily(CFName).setColumnNames(STREAM_VERSION_KEY);

        String last_key = "";
        query.setRowCount(row_count);


        if (log.isDebugEnabled()) {
            log.debug("Deleting stream definition with id : " + streamId);
        }

        boolean isLastRow = false;

        Mutator<String> mutator = HFactory.createMutator(keyspace, stringSerializer);

        boolean anotherVersionFound = false;
        while (!isLastRow) {
            query.setKeys(last_key, "");
            QueryResult<OrderedRows<String, String, String>> result = query.execute();

            int iter = 0;
            for (Row<String, String, String> row : result.get()) {
                iter++;
                if (row == null) {
                    continue;
                }

                if (!last_key.equals("") && iter == 1) {
                    //since last iteration-last row, and this iteration first ro returns same row.
                    continue;
                }

                // this has already been deleted, and hence a tombstone, refer http://wiki.apache.org/cassandra/FAQ#range_ghosts
                HColumn<String, String> versionColumn = row.getColumnSlice().getColumnByName(STREAM_VERSION_KEY);
                if (versionColumn == null) {
                    continue;
                }

                String actualVersion = versionColumn.getValue();

                // delete row
                if (deleteVersion.equals(actualVersion)) {
                    mutator.addDeletion(row.getKey(), CFName);

                } else {
                    anotherVersionFound = true;
                }

                last_key = row.getKey();

            }

            // delete off for every 1000 rows
            mutator.execute();

            if (result.get().getCount() < row_count) {
                isLastRow = true;
            }
        }

        // This is the only existing version of this stream definition. So delete the column family
        // backing the stream definition as well with the deletion of this stream definition
        if (!anotherVersionFound) {
            cluster.dropColumnFamily(keyspace.getKeyspaceName(), CFName);
        }


    }

    /**
     * Retrun Stream Definition   stored in stream definition column family under key domainName-streamIdKey
     *
     * @param streamId Stream Id
     * @return Returns event stream definition stored in BAM meta data keyspace
     * @throws StreamDefinitionStoreException Thrown if the stream definitions are malformed
     */

    public StreamDefinition getStreamDefinitionFromStore(String streamId) {
        try {
            int tenantId = PrivilegedCarbonContext.getThreadLocalCarbonContext().getTenantId();
            return ServiceHolder.getStreamDefinitionStoreService().getStreamDefinition(streamId, tenantId);
        } catch (StreamDefinitionStoreException e) {
            log.error("Error while retrieving the stream definition from stream definition store when storing " +
                    "the event in cassandra. " + e.getMessage(), e);
            return null;
        }
    }


//    public String getIndexDefinitionFromCassandra(Cluster cluster, String streamName)
//            throws StreamDefinitionStoreException {
//        StringBuilder indexSB = new StringBuilder();
//        String secIndex = "";
//        String custIndex = "";
//        String fixedIndex = "";
//        boolean incrementalIndex = false;
//        String arbitraryIndex = "";
//
//        Keyspace keyspace = getKeyspace(StreamDefinitionUtils.getIndexKeySpaceName(), cluster);
//        SliceQuery<String, String, String> sliceQuery =
//                HFactory.createSliceQuery(keyspace, stringSerializer, stringSerializer,
//                                          stringSerializer);
//        sliceQuery.setColumnFamily(INDEX_DEF_CF).setKey(streamName);
//        sliceQuery.setRange(null, null, false, 5);
//
//        QueryResult<ColumnSlice<String, String>> result = sliceQuery.execute();
//
//        for (HColumn<String, String> column : result.get().getColumns()) {
//            if (column.getName().equals(SECONDARY_INDEX_DEF)) {
//                secIndex = column.getValue();
//            } else if (column.getName().equals(CUSTOM_INDEX_DEF)) {
//                custIndex = column.getValue();
//            } else if (column.getName().equals(FIXED_SEARCH_DEF)) {
//                fixedIndex = column.getValue();
//            } else if (column.getName().equals(INCREMENTAL_INDEX)) {
//                incrementalIndex = true;
//            } else if (column.getName().equals(ARBITRARY_INDEX_DEF)) {
//                arbitraryIndex = column.getValue();
//            }
//        }
//
//        if (secIndex.isEmpty() && custIndex.isEmpty() && !fixedIndex.isEmpty()
//            && !incrementalIndex && !arbitraryIndex.isEmpty()) {
//            return null;
//        }
//
//        return indexSB.append(secIndex).append("|").append(custIndex).append("|").append(fixedIndex).
//                append("|").append(incrementalIndex).append("|").append(arbitraryIndex).toString();
//    }

    public void createColumnFamilyForStream(Cluster cluster,
                                            StreamDefinition streamDefinition) {
        String CFName = CassandraSDSUtils.convertStreamNameToCFName(streamDefinition.getName());

        ColumnFamilyDefinition cfDef = null;
        ColumnFamilyDefinition indexCfDef = null;
        String secondaryIndexDefn = null;
        String customIndexDefn = null;
        String arbitraryIndexDefn = null;
        boolean isIncremental = false;
        try {

            cfDef = getColumnFamily(cluster, StreamDefinitionUtils.getKeySpaceName(), CFName);
//            indexCfDef = getColumnFamily(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
//                                         CassandraSDSUtils.getIndexColumnFamilyName(CFName));
            if (!CFCache.getCF(cluster, StreamDefinitionUtils.getKeySpaceName(), CFName)) {
                if (cfDef == null) {
                    cfDef = createColumnFamily(cluster, StreamDefinitionUtils.getKeySpaceName(), CFName,
                            streamDefinition);
                } else {
                    CFCache.putCF(cluster, StreamDefinitionUtils.getKeySpaceName(), CFName, true);
                }
            }

            //Creating Indexes if exists in stream definition.
            //Todo - double check, need to create indexes for existing column families
            if (streamDefinition.getIndexDefinition() != null) {
                Keyspace indexKeyspace = getKeyspace(StreamDefinitionUtils.getIndexKeySpaceName(), cluster);
                Mutator<String> indexMutator = HFactory.createMutator(indexKeyspace, stringSerializer);
                secondaryIndexDefn = streamDefinition.getIndexDefinition().getSecondaryIndexDefn();
                customIndexDefn = streamDefinition.getIndexDefinition().getCustomIndexDefn();
                arbitraryIndexDefn = streamDefinition.getIndexDefinition().getArbitraryIndexDefn();
                isIncremental = streamDefinition.getIndexDefinition().isIncrementalIndex();

                if (secondaryIndexDefn != null) {
                    createSecondaryIndexes(cluster, cfDef, streamDefinition);
                }
                if (customIndexDefn != null) {
                    createCustomIndexes(cluster, cfDef, streamDefinition, CFName);
                }

                if (arbitraryIndexDefn != null) {
                    createArbitraryCustomIndexes(cluster, cfDef, streamDefinition, CFName);
                }

                if (isIncremental) {
                    //Initializing the IndexCF
                    if (!CFCache.getCF(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
                            CassandraSDSUtils.getIndexColumnFamilyName(CFName))) {
                        if (indexCfDef == null) {
                            indexCfDef = createIndexColumnFamily(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
                                    CassandraSDSUtils.getIndexColumnFamilyName(CFName));
                        } else {
                            CFCache.putCF(cluster, StreamDefinitionUtils.getIndexKeySpaceName(),
                                    CassandraSDSUtils.getIndexColumnFamilyName(CFName), true);
                        }
                    }
                }
            }


            List<ColumnDefinition> columnDefinitions = cfDef.getColumnMetadata();

            int originalColumnDefinitionSize = columnDefinitions.size();

            addFilteredColumnDefinitionsToColumnFamily(streamDefinition.getPayloadData(),
                    DataType.payload, columnDefinitions, cfDef);
            addFilteredColumnDefinitionsToColumnFamily(streamDefinition.getMetaData(),
                    DataType.meta, columnDefinitions, cfDef);
            addFilteredColumnDefinitionsToColumnFamily(streamDefinition.getCorrelationData(),
                    DataType.correlation, columnDefinitions,
                    cfDef);

            int newColumnDefinitionSize = cfDef.getColumnMetadata().size();

            if (originalColumnDefinitionSize != newColumnDefinitionSize) {
                cluster.updateColumnFamily(cfDef, true);
            }
            streamInitializationCache.put(streamDefinition.getStreamId(), Boolean.TRUE.toString());
        } catch (ExecutionException e) {
            log.error("Error while getting column family definition from cache at defined stream."
                    , e);
        }
    }


    // Default access methods shared witloadh unit tests

    void insertVariableFields(String streamColumnFamily, String rowKey,
                              Mutator<String> mutator,
                              Map<String, String> customKeyValuePairs) {
        for (Map.Entry<String, String> stringStringEntry : customKeyValuePairs.entrySet()) {
            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createStringColumn(stringStringEntry.getKey(),
                            stringStringEntry.getValue())
            );
        }
    }

    void insertVariableFieldsWithIndexing(String streamColumnFamily, String rowKey,
                                          Mutator<String> mutator,
                                          Map<String, String> customKeyValuePairs,
                                          Mutator<String> indexMutator,
                                          Map<String, Attribute> indexProps,
                                          long timestamp,
                                          Map<String, AttributeValue> fixedIndexPropertyValueMap) {
        for (Map.Entry<String, String> stringStringEntry : customKeyValuePairs.entrySet()) {
            mutator.addInsertion(rowKey, streamColumnFamily,
                    HFactory.createStringColumn(stringStringEntry.getKey(),
                            stringStringEntry.getValue())
            );
            if (indexProps.containsKey(stringStringEntry.getKey())) {
                Attribute attribute = indexProps.get(stringStringEntry.getKey());
                Object value = CassandraSDSUtils.getParsedArbitraryFieldValue(stringStringEntry.getValue(), attribute.getType());
                if (value != null) {
                    addIndexColumn(attribute, value, streamColumnFamily, rowKey, timestamp,
                            fixedIndexPropertyValueMap, indexMutator);
                } else {
                    log.debug("Parsing error. Cannot index the arbitrary field" + stringStringEntry.getKey());
                }
            } else {
                log.debug("Cannot Find Index for arbitrary field : " + stringStringEntry.getKey());
            }
        }
    }

    Mutator prepareDataForInsertion(Object[] data, List<Attribute> streamDefnAttrList,
                                    DataType dataType,
                                    String rowKey, String streamColumnFamily,
                                    Mutator<String> mutator) {
        for (int i = 0; i < streamDefnAttrList.size(); i++) {
            Attribute attribute = streamDefnAttrList.get(i);
            TypeInserter typeInserter = inserterMap.get(attribute.getType());
            String columnName = CassandraSDSUtils.getColumnName(dataType, attribute);

            typeInserter.addDataToBatchInsertion(data[i], streamColumnFamily, columnName, rowKey, mutator);
        }
        return mutator;
    }

    Mutator prepareCorrelationDataForInsertion(Object[] data, List<Attribute> streamDefnAttrList,
                                               DataType dataType,
                                               String rowKey, String streamColumnFamily,
                                               Mutator<String> mutator,
                                               Mutator<String> indexMutator,
                                               long timestamp) {
        for (int i = 0; i < streamDefnAttrList.size(); i++) {
            Attribute attribute = streamDefnAttrList.get(i);
            TypeInserter typeInserter = inserterMap.get(attribute.getType());
            String columnName = CassandraSDSUtils.getColumnName(dataType, attribute);

            typeInserter.addDataToBatchInsertion(data[i], streamColumnFamily, columnName, rowKey, mutator);

            if (attribute.getName().equals(BAM_ACTIVITY_ID)) {
                addActivityCorrelationIndex(String.valueOf(data[i]), rowKey, streamColumnFamily,
                        indexMutator, timestamp);
            }
        }
        return mutator;
    }

    Mutator prepareDataForInsertionWithIndexing(Object[] data, List<Attribute> streamDefnAttrList,
                                                DataType dataType,
                                                String rowKey, String streamColumnFamily,
                                                Mutator<String> mutator,
                                                Mutator<String> indexMutator,
                                                Map<String, Attribute> indexProps,
                                                long timestamp,
                                                Map<String, AttributeValue> fixedIndexPropertyValueMap) {
        for (int i = 0; i < streamDefnAttrList.size(); i++) {
            Attribute attribute = streamDefnAttrList.get(i);
            TypeInserter typeInserter = inserterMap.get(attribute.getType());
            String columnName = CassandraSDSUtils.getColumnName(dataType, attribute);

            typeInserter.addDataToBatchInsertion(data[i], streamColumnFamily, columnName, rowKey, mutator);

            if (indexProps.containsKey(attribute.getName())) {
                addIndexColumn(attribute, data[i], streamColumnFamily, rowKey, timestamp,
                        fixedIndexPropertyValueMap, indexMutator);
            }
        }
        return mutator;
    }

    Mutator prepareCorrelationDataForInsertionWithIndexing(Object[] data,
                                                           List<Attribute> streamDefnAttrList,
                                                           DataType dataType,
                                                           String rowKey, String streamColumnFamily,
                                                           Mutator<String> mutator,
                                                           Mutator<String> indexMutator,
                                                           Map<String, Attribute> indexProps,
                                                           long timestamp,
                                                           Map<String, AttributeValue> fixedIndexPropertyValueMap) {
        for (int i = 0; i < streamDefnAttrList.size(); i++) {
            Attribute attribute = streamDefnAttrList.get(i);
            TypeInserter typeInserter = inserterMap.get(attribute.getType());
            String columnName = CassandraSDSUtils.getColumnName(dataType, attribute);

            typeInserter.addDataToBatchInsertion(data[i], streamColumnFamily, columnName, rowKey, mutator);

            if (indexProps.containsKey(attribute.getName())) {
                addIndexColumn(attribute, data[i], streamColumnFamily, rowKey, timestamp,
                        fixedIndexPropertyValueMap, indexMutator);
            }

            if (attribute.getName().equals(BAM_ACTIVITY_ID)) {
                addActivityCorrelationIndex(String.valueOf(data[i]), rowKey, streamColumnFamily,
                        indexMutator, timestamp);
            }
        }
        return mutator;
    }

    public Mutator addIndexColumn(Attribute attribute, Object data, String streamColumnFamily,
                                  String rowKey, long timeStamp,
                                  Map<String, AttributeValue> fixedIndexPropertyValueMap,
                                  Mutator<String> mutator) {
        DynamicComposite colKey1 = new DynamicComposite();
        DynamicComposite colKey2 = new DynamicComposite();

        Object finalValueObj = null;
        Serializer serializer = null;
        boolean isMapModified = false;

        try {
            if (!fixedIndexPropertyValueMap.containsKey(attribute.getName())) {
                fixedIndexPropertyValueMap.put(attribute.getName(),
                        new AttributeValue(data, attribute));
                isMapModified = true;
            }

            for (String key : fixedIndexPropertyValueMap.keySet()) {
                AttributeType attributeType = fixedIndexPropertyValueMap.get(key).getAttribute().getType();
                Object attributeValue = fixedIndexPropertyValueMap.get(key).getValue();
                switch (attributeType) {
                    case BOOL: {
                        finalValueObj = (Boolean) attributeValue;
                        serializer = booleanSerializer;
                        break;
                    }
                    case INT: {          //Integers aslo inserting as longs until hector fixes on dynamic composite is done
                        finalValueObj = ((attributeValue) instanceof Double) ? ((Double) attributeValue).longValue()
                                : (Integer) attributeValue;
                        serializer = longSerializer;
                        break;
                    }
                    case DOUBLE: {
                        finalValueObj = (Double) attributeValue;
                        serializer = doubleSerializer;
                        break;
                    }
                    case FLOAT: {        //Floats aslo inserting as doubles until hector fixes on dynamic composite is done
                        finalValueObj = ((attributeValue) instanceof Double) ? ((Double) attributeValue).doubleValue() : (Float) attributeValue;
                        serializer = doubleSerializer;
                        break;
                    }
                    case LONG: {
                        finalValueObj = ((attributeValue) instanceof Double) ? ((Double) attributeValue).longValue() : (Long) attributeValue;
                        serializer = longSerializer;
                        break;
                    }
                    case STRING: {
                        finalValueObj = (String) attributeValue;
                        serializer = stringSerializer;
                        break;
                    }
                }
                if (finalValueObj != null) {
                    colKey1.addComponent(finalValueObj, serializer);
                }
            }
            colKey2.addComponent(finalValueObj, serializer);

            if (isMapModified) {
                fixedIndexPropertyValueMap.remove(attribute.getName());
            }

            colKey1.addComponent(timeStamp, longSerializer);
            colKey1.addComponent(rowKey, stringSerializer);
            String indexColName = CassandraSDSUtils.getCustomIndexCFNameForInsert(streamColumnFamily, attribute.getName());
            mutator.addInsertion(CUSTOM_INDEX_ROWS_KEY,
                    indexColName,
                    HFactory.createColumn(colKey1, rowKey, dynamicCompositeSerializer, stringSerializer));
            mutator.addInsertion(CUSTOM_INDEX_VALUE_ROW_KEY,
                    indexColName,
                    HFactory.createColumn(colKey2, "", dynamicCompositeSerializer, stringSerializer));
        } catch (Exception e) {
            log.debug("Error while adding index column ", e);
        }
        return mutator;
    }

    Object getValueForDataTypeList(
            ColumnSlice<String, ByteBuffer> columnSlice, Attribute payloadDefinition,
            DataType dataType) throws IOException {
        HColumn<String, ByteBuffer> eventCol =
                columnSlice.getColumnByName(
                        CassandraSDSUtils.getColumnName(dataType, payloadDefinition));
        return CassandraSDSUtils
                .getOriginalValueFromColumnValue(eventCol.getValue(), payloadDefinition.getType());
    }

    Mutator<String> getMutator(Cluster cluster) throws StreamDefinitionStoreException {
        Keyspace keyspace = getKeyspace(StreamDefinitionUtils.getKeySpaceName(), cluster);
        return HFactory.createMutator(keyspace, stringSerializer);
    }

    private Mutator<String> getMutator(Cluster cluster, String keySpaceName)
            throws StreamDefinitionStoreException {
        Keyspace keyspace = getKeyspace(keySpaceName, cluster);
        return HFactory.createMutator(keyspace, stringSerializer);
    }

    static Keyspace getKeyspace(String keyspace, Cluster cluster) {
        return HFactory.createKeyspace(keyspace, cluster, StreamDefinitionUtils.getGlobalConsistencyLevelPolicy());
    }

}



