import {
  Service,  
  Accessory,
  Categories,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  uuid
} from "hap-nodejs";


// DockerPi SensorHub 
// see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0

// SensorHub address
const DEVICE_BUS = 1; 
const DEVICE_ADDR = 0x17;

// SensorHub offboard sensor
const TEMP_REG = 0x01;

// SensorHub onboard sensors
const LIGHT_REG_L = 0x02;
const LIGHT_REG_H = 0x03;

const STATUS_REG = 0x04;

const ON_BOARD_TEMP_REG = 0x05;
const ON_BOARD_HUMIDITY_REG = 0x06;

const ON_BOARD_SENSOR_ERROR = 0x07;

const MOTION_DETECT = 0x0D;

// SensorHub BMP280 sensors
const BMP280_TEMP_REG = 0x08;
const BMP280_PRESSURE_REG_L = 0x09;
const BMP280_PRESSURE_REG_M = 0x0A;
const BMP280_PRESSURE_REG_H = 0x0B;
const BMP280_STATUS = 0x0C;

// SensorHub STATUS_REG register
const T_OVR = 0x01; // Temperature Overflow
const T_FAIL = 0x02; // Temperture Not Found
const L_OVR = 0x03; // Brightness Overlow
const L_FAIL = 0x04; // Brightness Not Found


//
// SensorHub Accessory
//
 
const sensorHubAccessory = new Accessory("SensorHub", uuid.generate("homekit-sensorhub.wiesi69"));
  
// SensorHub light brightness sensor

const lightSensor = new Service.LightSensor("Light Sensor")
let ligthBrithness = 0;

const ligthBrightnessCharacteristic = lightSensor.getCharacteristic(Characteristic.Brightness)!;
ligthBrightnessCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current light brightness:" +ligthBrithness + " Lux");
  callback(undefined, ligthBrithness);
});

sensorHubAccessory.addService(lightSensor);



// SensorHub onboard temperature sensor

const onBoardTemperatureSensor = new Service.TemperatureSensor("OnBoard Temperature Sensor");
let onBoardTemperature = 0.0;

const onBoardTemperatureCharacteristic = onBoardTemperatureSensor.getCharacteristic(Characteristic.CurrentTemperature)!;
onBoardTemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current room temperature: " + onBoardTemperature + " C");
  callback(undefined, onBoardTemperature);
});

sensorHubAccessory.addService(onBoardTemperatureSensor);



// SensorHub onboard humidity sensor

const onBoardHumiditySensor = new Service.HumiditySensor("OnBoard Humidity Sensor");
let onBoardHumidity = 0.0;

const onBoardHumidityCharacteristic = onBoardHumiditySensor.getCharacteristic(Characteristic.CurrentRelativeHumidity)!;
onBoardHumidityCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current humidity: " + onBoardHumidity + "%");
  callback(undefined, onBoardHumidity);
});

sensorHubAccessory.addService(onBoardHumiditySensor);



// SensorHub motion dection sensor

const motionDetectionSensor = new Service.MotionSensor("Motion Detection Sensor");
let motionDetected = false;

const motionDetectionCharacteristic = motionDetectionSensor.getCharacteristic(Characteristic.MotionDetected)!;
motionDetectionCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried motion detected: " + motionDetected );
  callback(undefined, motionDetected);
});

sensorHubAccessory.addService(motionDetectionSensor);




// Publisch SensorHub Accessory

sensorHubAccessory.publish({
  username: "b8:27:eb:7b:6f:a2",
  pincode: "666-69-999",
  port: 47128,
  category: Categories.SENSOR,
});
  
console.log("SensorHub accessory published.");


//
// Create and publish offboard accessory 
//

const sensorHubBmp280Accessory = new Accessory("SensorHub", uuid.generate("wiesi69/homekit-sensorhub-bmp280"));


// SensorHub BMP280 Temperature Sensor
const bmp280TemperatureSensorService = new Service.TemperatureSensor("BMP280 Temperature Sensor");
let bmp280Temperature = 0.0;

const bmp280TemperatureCharacteristic = bmp280TemperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature)!;
bmp280TemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current BMP280 temperature: " + bmp280Temperature + " C");
  callback(undefined, bmp280Temperature);
});

sensorHubBmp280Accessory.addService(bmp280TemperatureSensorService);


/* Pressure Sensor not supported by HomeKit Accesssory Protocol
// SensorHub BMP280 Pressure Sensor
const bmp280PressurSensorService = new Service.TemperatureSensor("BMP280 Pressure Sensor");
let bmp280Pressure = 0.0;

const bmp280PressureCharacteristic = bmp280PressurSensorService.getCharacteristic(Characteristic.CurrentPressure)!;
bmp280PressureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current BMP280 temperature: " + bmp280Pressure + " pascal");
  callback(undefined, bmp280Pressure);
});

sensorHubBmp280Accessory.addService(bmp280TemperatureSensorService); 
*/



sensorHubBmp280Accessory.publish({
  username: "69:00:eb:7b:6f:02", // new username 
  pincode: "666-69-999",
  port: 47002, //new port
  category: Categories.SENSOR, // value here defines the symbol shown in the pairing screen
});
  
console.log("SensorHub BMP280 accessory published");





//
// Create and publish offboard accessory 
//

const sensorHubOffBoardAccessory = new Accessory("SensorHub", uuid.generate("wiesi69/homekit-sensorhub-offboard"));

const offBoardTemperatureSensorService = new Service.TemperatureSensor("Offboard Temperature");
let offBoardTemperature = 0.0;

const offBoardTemperatureCharacteristic = offBoardTemperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature)!;

// set minValue to -100 (Apple's HomeKit Accessorry Protocol defines minValue to 0, maybe it's true for California  ...)
offBoardTemperatureCharacteristic.setProps({
  minValue: -100,
  maxValue: 100
});

offBoardTemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
  console.log("Queried current outside temperature: " + offBoardTemperature + " C");
  callback(undefined, offBoardTemperature);
});


sensorHubOffBoardAccessory.addService(offBoardTemperatureSensorService);


sensorHubOffBoardAccessory.publish({
  username: "69:00:eb:7b:6f:03", // new username 
  pincode: "666-69-999",
  port: 47003, //new port
  category: Categories.SENSOR, // value here defines the symbol shown in the pairing screen
});
  
console.log("SensorHub Off-Board accessory published.");

