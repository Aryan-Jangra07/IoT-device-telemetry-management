const { InfluxDB, Point } = require('@influxdata/influxdb-client');

const token = process.env.INFLUX_TOKEN;
const org = process.env.INFLUX_ORG;
const bucket = process.env.INFLUX_BUCKET;

const client = new InfluxDB({ url: process.env.INFLUX_URL, token: token });
const writeApi = client.getWriteApi(org, bucket);

const writeTelemetry = (deviceId, count) => {
  for (let i = 0; i < count; i++) {
    const temp = (Math.random() * (40 - 20) + 20).toFixed(2);
    const hum = (Math.random() * (80 - 40) + 40).toFixed(2);
    const volt = (Math.random() * (4.2 - 3.0) + 3.0).toFixed(25);

    const point = new Point('device_metrics')
      .tag('deviceId', deviceId)
      .floatField('temperature', parseFloat(temp))
      .floatField('humidity', parseFloat(hum))
      .floatField('voltage', parseFloat(volt))
      .timestamp(new Date(Date.now() - i * 1000)); // offset timestamps slightly to avoid overwriting

    writeApi.writePoint(point);
  }
  
  writeApi.flush().catch(err => console.error('InfluxDB Flush Error:', err));
};

const writeRealTelemetry = (deviceId, data) => {
  const { temperature, humidity, voltage } = data;
  if (temperature === undefined) return;

  const point = new Point('device_metrics')
    .tag('deviceId', deviceId)
    .floatField('temperature', parseFloat(temperature))
    .floatField('humidity', parseFloat(humidity))
    .floatField('voltage', parseFloat(voltage))
    .timestamp(new Date());

  writeApi.writePoint(point);
  writeApi.flush().catch(err => console.error('InfluxDB Flush Error (Real):', err));
};

const readTelemetry = async (deviceId, range = '-1h') => {
  const queryApi = client.getQueryApi(org);
  const fluxQuery = `
    from(bucket: "${bucket}")
      |> range(start: ${range})
      |> filter(fn: (r) => r["_measurement"] == "device_metrics")
      |> filter(fn: (r) => r["deviceId"] == "${deviceId}")
      |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
  `;

  const results = [];
  return new Promise((resolve, reject) => {
    queryApi.queryRows(fluxQuery, {
      next(row, tableMeta) {
        results.push(tableMeta.toObject(row));
      },
      error(error) {
        reject(error);
      },
      complete() {
        resolve(results);
      },
    });
  });
};

module.exports = { writeTelemetry, writeRealTelemetry, readTelemetry };
