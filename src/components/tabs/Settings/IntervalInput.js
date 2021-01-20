import React, { useState } from "react";

const IntervalInput = () => {
  const [tempMonitoringFrequency, setTempMonitoringFrequency] = useState("");
  const [tempNotifFreq, setTempNotifFreq] = useState("");

  const addNotificationFrequency = (data) =>
    dispatch(actions.addNotificationFrequency(data));
  const addMonitoringFrequency = (data) =>
    dispatch(actions.addMonitoringFrequency(data));

  const notificationFrequency = () => {
    // default value for Notification Frequency
    let frequency = 5;
    // alert if input is not a number
    if (isNaN(Number(tempNotifFreq)))
      alert("Please enter notification frequency in numerical format. ex: 15");
    else {
      if (tempNotifFreq) frequency = tempNotifFreq;
      query(
        queryType.INSERT_NOTIFICATION_FREQUENCY,
        ["admin", , frequency, ,],
        (err, res) => {
          if (err) {
            console.log(`INSERT_NOTIFICATION_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            // props.addNotificationFrequency(frequency);
          }
        }
      );
    }
  };

  const monitoringFrequency = () => {
    // default value for Monitoring Frequency
    let frequency = 2;
    // alert if input is not a number
    if (isNaN(Number(tempMonitoringFrequency)))
      alert("Please enter monitoring frequency in numerical format. ex: 15");
    else {
      if (tempMonitoringFrequency) frequency = tempMonitoringFrequency;
      query(
        queryType.INSERT_MONITORING_FREQUENCY,
        ["admin", , , frequency],
        (err, res) => {
          if (err) {
            console.log(`INSERT_MONITORING_FREQUENCY. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            props.addMonitoringFrequency(frequency);
          }
        }
      );
    }
  };

  return <p>1. Link mobile phone to your account</p>;
};

export default IntervalInput;
