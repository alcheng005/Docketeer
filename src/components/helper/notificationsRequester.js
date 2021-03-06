/* eslint-disable implicit-arrow-linebreak */
import { ipcRenderer } from "electron";
import store from "../../renderer/store";
import * as categories from "../../constants/notificationCategories";
import query from "./psqlQuery";

// object that holds what notifications have been sent
const sentNotifications = {};
let state;

// Return the container's metric value for the notification type/rule it's registered to
const getTargetMetric = (containerObject, notificationSettingType) => {
  if (notificationSettingType === categories.MEMORY)
    return parseFloat(containerObject.MemPerc.replace("%", ""));
  if (notificationSettingType === categories.CPU)
    return parseFloat(containerObject.CPUPerc.replace("%", ""));
  if (notificationSettingType === categories.STOPPED) return 1;
};

// return the containers that have registered for notifications
const getContainerObject = (containerList, containerId) => {
  const resultContainer = containerList.filter(
    (container) => container.ID === containerId
  );
  return resultContainer.length ? resultContainer[0] : undefined;
};

// Is there an existing event for the container. This is needed to resend another notification based on resend interval / monitoring frequency
const isContainerInSentNotifications = (notificationType, containerId) => {
  if (sentNotifications[notificationType]) {
    // return true if the notificationType key in sentNotification contains our containerId
    return Object.prototype.hasOwnProperty.call(
      sentNotifications[notificationType],
      containerId
    );
  }
  // return false since container's notification category is not present
  return false;
};

const constructNotificationMessage = (
  notificationType,
  stat,
  triggeringValue,
  containerId
) => {
  let message = "";
  switch (notificationType) {
    case categories.STOPPED:
      message = `Container with ID of ${containerId} has stopped`;
      break;
    case categories.CPU || categories.MEMORY:
      message = `${notificationType} alert for container with ID of ${containerId}. Current Value: ${stat}; Alert Setting: ${triggeringValue}`;
      break;
    default:
      message = `${notificationType} alert for container with ID of ${containerId}. Current Value: ${stat}; Alert Setting: ${triggeringValue}`;
      break;
  }

  return message;
};

// this function will make a request that will trigger a notification
const sendNotification = async (
  notificationType,
  containerId,
  stat,
  triggeringValue
) => {  
  // request notification
  console.log(`Requesting notification to phoneNumber: ${state.notificationList.phoneNumber}`);
  const body = {
    mobileNumber: state.notificationList.phoneNumber.mobile,
    triggeringEvent: constructNotificationMessage(
      notificationType,
      stat,
      triggeringValue,
      containerId
    ),
  };  

  await ipcRenderer.invoke("post-event", body);
};

// Returns the DateTime the last notification was sent per notification type, per containerId
const getLatestNotificationDateTime = (notificationType, containerId) =>
  sentNotifications[notificationType][containerId];

// Checks to see if a notification should be sent based on notification container is subscribed to
const checkForNotifications = (
  notificationSettingsSet,
  notificationType,
  containerList,
  triggeringValue
) => {
  /**
   * The amount of seconds to wait before resend notification
   * when container problem has not been addressed
   */
  const RESEND_INTERVAL = state.notificationList.notificationFrequency * 60; // seconds

  // scan notification settings
  notificationSettingsSet.forEach((containerId) => {
    // check container metrics if it is seen in either runningList or stoppedList
    const containerObject = getContainerObject(containerList, containerId);
    if (containerObject) {
      // gets the stat/metric on the container that we want to test
      const stat = getTargetMetric(containerObject, notificationType);
      console.log("stat", stat, "triggeringValue", triggeringValue);
      // if the stat should trigger rule
      if (stat > triggeringValue) {
        // if the container is in sentNotifications object
        if (isContainerInSentNotifications(notificationType, containerId)) {
          // get the time from the sentNotifications object
          const notificationLastSent = getLatestNotificationDateTime(
            notificationType,
            containerId
          );

          // calculate time between now and last notification sent time
          let spentTime = Math.floor(
            (Date.now() - notificationLastSent) / 1000
          );

          // check if enough time (RESEND_INTERVAL) has passed since laster notification sent.
          if (spentTime > RESEND_INTERVAL) {
            // send nofication
            sendNotification(
              notificationType,
              containerId,
              stat,
              triggeringValue
            );           

            // update date.now in object that stores sent notifications
            sentNotifications[notificationType][containerId] = Date.now();
          } else {
            // resend interval not yet met
            console.log(
              `** Resend Interval Not Met. Resending notification in ${RESEND_INTERVAL - spentTime}\nLast sent notification time: ${notificationLastSent}`
            );
          }
        } else {
          // Container not in sentNotifications.
          // Add it with time as now and send notification.
          sendNotification(
            notificationType,
            containerId,
            stat,
            triggeringValue
          );
          if (sentNotifications[notificationType]) {
            sentNotifications[notificationType][containerId] = Date.now();
          } else {
            sentNotifications[notificationType] = { [containerId]: Date.now() };
          }

          // send nofication
          sendNotification(
            notificationType,
            containerId,
            stat,
            triggeringValue
          );
          console.log(
            `** Notification SENT. ${notificationType} containerId: ${containerId} stat: ${stat} triggeringValue: ${triggeringValue}`
          );
        }
      } else {
        // since metric is under threshold, remove container from sentNotifications if present
        // this reset
        if (isContainerInSentNotifications(notificationType, containerId)) {
          delete sentNotifications[notificationType][containerId];
        }
      }
    }
  });
};

const getMonitoringFrequency = async () => {
  const result = await query("select monitoring_frequency from users;");
  return result.rows[0].monitoring_frequency;
};

// function to start monitoring containers for metric thresholds
export default async function start() {
  // get current state in order to get default monitoringFrequency
  state = store.getState();

  // get monitoring interval from DB
  const monitoringFrequency = await getMonitoringFrequency();

  // set interval based on user provided monitoring frequency/interval
  setInterval(() => {
    state = store.getState();
    if (state.notificationList.phoneNumber.isVerified) {
      // check if any containers register to memory notification exceed triggering memory value
      checkForNotifications(
        state.notificationList.memoryNotificationList,
        categories.MEMORY,
        state.containersList.runningList,
        80 // triggering value
      );
      // check if any containers register to cpu notification exceed triggering cpu value
      checkForNotifications(
        state.notificationList.cpuNotificationList,
        categories.CPU,
        state.containersList.runningList,
        80 // triggering value
      );
      // check if any containers register to stopped notification trigger notification
      checkForNotifications(
        state.notificationList.stoppedNotificationList,
        categories.STOPPED,
        state.containersList.stoppedList,
        0 // triggering value
      );
    }
  }, monitoringFrequency * 60 * 1000); // milliseconds
}
