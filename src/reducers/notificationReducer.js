import * as types from "../constants/actionTypes";

const initialState = {
  phoneNumber: { mobile: "", isVerified: false },
  notificationFrequency: 5,
  monitoringFrequency: 2,
  memoryNotificationList: new Set(),
  cpuNotificationList: new Set(),
  stoppedNotificationList: new Set(),
};

export default function (state = initialState, action) {
  switch (action.type) {
    case types.ADD_PHONE_NUMBER:
      return {
        ...state,
        phoneNumber: { ...action.payload },
      };

    case types.ADD_MEMORY_NOTIFICATION_SETTING:
      const memoryNotificationList = new Set(action.payload);
      return {
        ...state,
        memoryNotificationList,
      };

    case types.ADD_CPU_NOTIFICATION_SETTING:
      const cpuNotificationList = new Set(action.payload);
      return {
        ...state,
        cpuNotificationList,
      };

    case types.ADD_STOPPED_NOTIFICATION_SETTING:
      const stoppedNotificationList = new Set(action.payload);
      return {
        ...state,
        stoppedNotificationList,
      };

    case types.REMOVE_MEMORY_NOTIFICATION_SETTING:
      const newMemoryNotificationList = [];
      state.memoryNotificationList.forEach((containerId) => {
        if (containerId !== action.payload)
          newMemoryNotificationList.push(containerId);
      });
      return {
        ...state,
        memoryNotificationList: newMemoryNotificationList,
      };

    case types.REMOVE_CPU_NOTIFICATION_SETTING:
      const newCpuNotificationList = [];
      state.cpuNotificationList.forEach((containerId) => {
        if (containerId !== action.payload)
          newCpuNotificationList.push(containerId);
      });
      return {
        ...state,
        cpuNotificationList: newCpuNotificationList,
      };

    case types.REMOVE_STOPPED_NOTIFICATION_SETTING:
      const newStoppedNotificationList = [];
      state.stoppedNotificationList.forEach((containerId) => {
        if (containerId !== action.payload)
          stoppedNotificationList.push(containerId);
      });
      return {
        ...state,
        stoppedNotificationList: newStoppedNotificationList,
      };

    case types.NOTIFICATION_FREQUENCY:
      return {
        ...state,
        notificationFrequency: action.payload,
      };

    case types.MONITORING_FREQUENCY:
      return {
        ...state,
        monitoringFrequency: action.payload,
      };

    default:
      return state;
  }
}
