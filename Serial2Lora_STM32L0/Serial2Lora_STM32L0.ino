#include "LoRaWAN.h"
#include "creds.h"
#include <HTS221Sensor.h>
#include <LPS22HHSensor.h>

#define DEV_I2C Wire
#define REGION_US915

LPS22HHSensor PressTemp(&DEV_I2C);
HTS221Sensor HumTemp(&DEV_I2C);

String my_string = "";

void setup( void )
{
  Serial1.begin(460800);
  Serial.begin(115200);
  while (!Serial) {
    ;
  }
 
  DEV_I2C.begin(); 
  PressTemp.begin();
  PressTemp.Enable();
  HumTemp.begin();
  HumTemp.Enable();
  
  LoRaWAN.begin(US915);
  LoRaWAN.setSubBand(2);
  LoRaWAN.joinOTAA(appEui, appKey, devEui);
  Serial.println("Link START!");
}

void loop( void )
{
  float humidity = 0, temperature = 0;
  HumTemp.GetHumidity(&humidity);
  HumTemp.GetTemperature(&temperature);
  float pressure = 0, temperature2 = 0;
  PressTemp.GetPressure(&pressure);
  PressTemp.GetTemperature(&temperature2);

  if (Serial1.available()) {
    String temp = Serial1.readString();
    int checkpoint1 = temp.indexOf(":", 25);
    int checkpoint2 = temp.indexOf(",", 25);
    temp = temp.substring(checkpoint1+1, checkpoint2);
    my_string = temp+","+String(int(humidity))+","+String(int(temperature))+","+String(int(pressure));
    uint8_t payload[my_string.length()+1];
    my_string.getBytes(payload, my_string.length()+1);
    sendResult(payload,my_string.length()+1);
    delay(1000);
  }
}

bool sendResult(uint8_t spayload[],int paySize) {
  if (LoRaWAN.joined() && !LoRaWAN.busy())
  {
    LoRaWAN.sendPacket(1, spayload, paySize);
    return true;
  }
  return false;
}
