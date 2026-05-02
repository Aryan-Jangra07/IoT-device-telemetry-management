const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;
const url = process.env.INFLUX_URL;

if (!token || !org || !bucket || !url) {
  console.warn('[WARN] InfluxDB environment variables are missing! Telemetry might not be saved.');
} else {
  console.log('[INFO] InfluxDB Service Initialized');
}

const client = new InfluxDB({ url, token });
const writeApi = client.getWriteApi(org, bucket);

/**
 * Write telemetry data to InfluxDB
 * @param {string} deviceId 
 * @param {object} data - { temperature, status, humidity, voltage }
 */
const writeTelemetry = (deviceId, data) => {
  const { temperature, status, humidity, voltage } = data;
  
  const point = new Point('device_telemetry')
    .tag('deviceId', deviceId)
    .timestamp(new Date());

  if (temperature !== undefined) point.floatField('temperature', parseFloat(temperature));
  if (humidity !== undefined) point.floatField('humidity', parseFloat(humidity));
  if (voltage !== undefined) point.floatField('voltage', parseFloat(voltage));
  if (status !== undefined) point.stringField('status', status);

  writeApi.writePoint(point);
  writeApi.flush().catch(err => console.error('InfluxDB Flush Error:', err));
};

/**
 * Read telemetry from InfluxDB for a given deviceId
 * @param {string} deviceId
 * @param {string} range - Flux range string e.g. '-1h'
 */
const readTelemetry = async (deviceId, range = '-1h') => {
  const queryApi = client.getQueryApi(org);
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r["_measurement"] == "device_telemetry")
      |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;
  const results = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) { results.push(tableMeta.toObject(row)); },
      error(error) { reject(error); },
      complete() { resolve(results); },
    });
  });
};

module.exports = { writeTelemetry, readTelemetry };
