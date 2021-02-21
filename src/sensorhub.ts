import {
  Service,
  Accessory,
  Categories,
  Characteristic,
  CharacteristicEventTypes,
  CharacteristicGetCallback,
  uuid
} from "hap-nodejs";
import { NetworkClientProfileControl } from "hap-nodejs/dist/lib/definitions";

import {
} from "i2c-bus";

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



class SensorHub {

  ligthBrithness: number = 0;
  onBoardTemperature: number = 0.0;
  onBoardHumidity: number = 0.0;
  motionDetected: boolean = false;
  bmp280Temperature: number = 0.0;
  bmp280Pressure: number = 0.0;
  offBoardTemperature: number = 0.0;
  lastUpdate: Date = new Date();

  constructor() {
    this.createSensorHubAccessory();
    this.createSensorrHubBmp280Accessory();
    this.createSensorHubOffBoardAccessorry();
  }

  // 
  // Create Accessories
  //

  createSensorHubAccessory() {
    const sensorHubAccessory = new Accessory("SensorHub", uuid.generate("homekit-sensorhub"));

    sensorHubAccessory.addService(this.createLightSensor());
    sensorHubAccessory.addService(this.createOnBoardTemperatureSensor());
    sensorHubAccessory.addService(this.createOnBoardHumiditySensor());
    sensorHubAccessory.addService(this.createMotionDetector());

    this.publishAccessory(sensorHubAccessory, "b8:27:eb:7b:6f:a2", 47128)

  }


  createSensorrHubBmp280Accessory() {
    const sensorHubBmp280Accessory = new Accessory("SensorHub", uuid.generate("homekit-sensorhub-bmp280"));

    sensorHubBmp280Accessory.addService(this.createBmp280TemperatureSensorService());
    // sensorHubBmp280Accessory.addService(this.createBmp280PressureSensorService()); 

    this.publishAccessory(sensorHubBmp280Accessory, "b8:27:eb:7b:6f:02", 47002);
  }


  createSensorHubOffBoardAccessorry() {
    const sensorHubOffBoardAccessory = new Accessory("SensorHub", uuid.generate("homekit-sensorhub-offboard"));
    sensorHubOffBoardAccessory.addService(this.createOffBoardTemperatureSensorService());

    this.publishAccessory(sensorHubOffBoardAccessory, "b8:27:eb:7b:6f:03", 47003);
  }



  //
  // Create Sensor Functions
  //

  createLightSensor(): Service {
    const lightSensor = new Service.LightSensor("Light Sensor")

    const ligthBrightnessCharacteristic = lightSensor.getCharacteristic(Characteristic.Brightness)!;
    ligthBrightnessCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried current light brightness:" + this.ligthBrithness + " Lux");
      callback(undefined, this.ligthBrithness);
    });

    return lightSensor;
  }

  createOnBoardTemperatureSensor(): Service {

    const onBoardTemperatureSensor = new Service.TemperatureSensor("OnBoard Temperature Sensor");
    const onBoardTemperatureCharacteristic = onBoardTemperatureSensor.getCharacteristic(Characteristic.CurrentTemperature)!;

    onBoardTemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried current room temperature: " + this.onBoardTemperature + " C");
      callback(undefined, this.onBoardTemperature);
    });

    return onBoardTemperatureSensor;
  }


  createOnBoardHumiditySensor(): Service {
    const onBoardHumiditySensor = new Service.HumiditySensor("OnBoard Humidity Sensor");
    const onBoardHumidityCharacteristic = onBoardHumiditySensor.getCharacteristic(Characteristic.CurrentRelativeHumidity)!;

    onBoardHumidityCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried current humidity: " + this.onBoardHumidity + "%");
      callback(undefined, this.onBoardHumidity);
    });

    return onBoardHumiditySensor;
  }



  createMotionDetector(): typeof Service | Service {
    const motionDetectionSensor = new Service.MotionSensor("Motion Sensor");
    const motionDetectionCharacteristic = motionDetectionSensor.getCharacteristic(Characteristic.MotionDetected)!;
    motionDetectionCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried motion detected: " + this.motionDetected);
      callback(undefined, this.motionDetected);
    });

    return motionDetectionSensor;
  }


  createBmp280TemperatureSensorService(): Service {
    const bmp280TemperatureSensorService = new Service.TemperatureSensor("BMP280 Temperature Sensor");
    const bmp280TemperatureCharacteristic = bmp280TemperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature)!;
    bmp280TemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried current BMP280 temperature: " + this.bmp280Temperature + " C");
      callback(undefined, this.bmp280Temperature);
    });
    return bmp280TemperatureSensorService;
  }

  /*
  createBmp280PressureSensorService(): Service {
    const bmp280PressurSensorService = new Service.PressureSensor("BMP280 Pressure Sensor");
    const bmp280PressureCharacteristic = bmp280PressurSensorService.getCharacteristic(Characteristic.CurrentPressure)!;
    bmp280PressureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.log("Queried current BMP280 temperature: " + bmp280Pressure + " pascal");
      callback(undefined, bmp280Pressure);
    });
    return bmp280PressurSensorService;
  }
*/



  createOffBoardTemperatureSensorService(): Service {
    const offBoardTemperatureSensorService = new Service.TemperatureSensor("Offboard Temperature");

    const offBoardTemperatureCharacteristic = offBoardTemperatureSensorService.getCharacteristic(Characteristic.CurrentTemperature)!;

    // set minValue to -100 (Apple's HomeKit Accessorry Protocol defines minValue to 0, maybe it's true for California  ...)
    offBoardTemperatureCharacteristic.setProps({
      minValue: -100,
      maxValue: 100
    });

    offBoardTemperatureCharacteristic.on(CharacteristicEventTypes.GET, (callback: CharacteristicGetCallback) => {
      console.debug("Queried current outside temperature: " + this.offBoardTemperature + " C");
      callback(undefined, this.offBoardTemperature);
    });
    return offBoardTemperatureSensorService;
  }



  publishAccessory(accessory: Accessory, username: string, port: number) {

    accessory.publish({
      username: username,
      pincode: "666-69-999",
      port: port,
      category: Categories.SENSOR,
    });

    console.debug("SensorHub accessory " + username + "published with port " + port);
  }



  // DockerPi SensorHub 
  getSensorData() {

    // see https://wiki.52pi.com/index.php/DockerPi_Sensor_Hub_Development_Board_SKU:_EP-0106#DockerPi_Sensor_Hub_Development_Board_V2.0



  }
}




//
// main
//

let sensorHub = new SensorHub();
