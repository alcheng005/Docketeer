import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import * as actions from "../../../actions/actions";
import * as categories from "../../../constants/notificationCategories";
import query from "../../helper/psqlquery";
import * as queryType from "../../../constants/queryTypes";
import { makeStyles } from "@material-ui/core/styles";
import ContainerSettingsTable from "./ContainerSettingsTable";
import PhoneInput from "./PhoneInput";
import IntervalInput from "./IntervalInput";

const useStyles = makeStyles(() => ({
  root: {
    "& .MuiTextField-root": {
      marginLeft: 5,
      marginBottom: 15,
      width: 220,
      verticalAlign: "middle",
    },
  },
  button: {
    "& > *": {
      pointerEvents: "none",
    },
  },
  button: {
    marginLeft: 5,
    width: 100,
    verticalAlign: "top",
  },
  verifiedIcon: {
    verticalAlign: "top",
    color: "green",
  },
  description: {
    marginLeft: 5,
    marginBottom: 30,
  },
}));

// showVerificationInput IS ISED FOR RENDERING THE VERIFICATION CODE COMPONENT

const Settings = (props) => {
  const dispatch = useDispatch();
  const addMemoryNotificationSetting = (data) =>
    dispatch(actions.addMemoryNotificationSetting(data));
  const addCpuNotificationSetting = (data) =>
    dispatch(actions.addCpuNotificationSetting(data));
  const addStoppedNotificationSetting = (data) =>
    dispatch(actions.addStoppedNotificationSetting(data));
  // const removeMemoryNotificationSetting = (data) => dispatch(actions.removeMemoryNotificationSetting(data));
  // const removeCpuNotificationSetting = (data) => dispatch(actions.removeCpuNotificationSetting(data));
  // const removeStoppedNotificationSetting = (data) => dispatch(actions.removeStoppedNotificationSetting(data));

  // // handle check
  // // I couldve made this a single function where queryType gets passed in
  // // but the query's parameters are not the same
  // const handleCheckSetting = (containerId, containerName, metricName) => {
  //   // add to DB
  //   query(
  //     queryType.INSERT_CONTAINER,
  //     [containerId, containerName],
  //     (err, res) => {
  //       if (err) {
  //         console.log(`Error in INSERT_CONTAINER. Error: ${err}`);
  //       } else {
  //         // if all good, call fetchNotificationSettings
  //         fetchNotificationSettings();
  //         console.log('** INSERT_CONTAINER returned: **', res);
  //       }
  //     },
  //   );

  //   query(
  //     queryType.INSERT_CONTAINER_SETTING,
  //     [containerId, metricName.toLowerCase()],
  //     (err, res) => {
  //       if (err) {
  //         console.log(`Error in INSERT_CONTAINER_SETTING. Error: ${err}`);
  //       } else {
  //         // if all good, call fetchNotificationSettings
  //         fetchNotificationSettings();
  //         console.log('** INSERT_CONTAINER_SETTING returned: **', res);
  //       }
  //     },
  //   );
  // };

  // // handle uncheck
  // // remove from DB
  // const handleUnCheckSetting = (containerId, metricName) => {
  //   // add to DB
  //   query(
  //     queryType.DELETE_CONTAINER_SETTING,
  //     [containerId, metricName.toLowerCase()],
  //     (err, res) => {
  //       if (err) {
  //         console.log(`Error in DELETE_CONTAINER_SETTING. Error: ${err}`);
  //       } else {
  //         // if all good, call fetchNotificationSettings
  //         fetchNotificationSettings();
  //         console.log('** DELETE_CONTAINER_SETTING returned: **', res);
  //       }
  //     },
  //   );
  // };

  const fetchNotificationSettings = () => {
    return query(queryType.GET_NOTIFICATION_SETTINGS, [], (err, res) => {
      if (err) {
        console.log(`Error getting settings. Error: ${err}`);
      } else {
        // find a way to set the three lists here
        // iterate through res.row
        // if the metric_name = "memory"
        let tempMemory = [];
        let tempCPU = [];
        let tempStopped = [];

        res.rows.forEach((el) => {
          switch (el.metric_name) {
            case categories.MEMORY.toLowerCase():
              tempMemory.push(el.container_id);
              break;
            case categories.CPU.toLowerCase():
              tempCPU.push(el.container_id);
              break;
            case categories.STOPPED.toLowerCase():
              tempStopped.push(el.container_id);
              break;
            default:
              break;
          }
        });

        // replace state with new data from database
        addMemoryNotificationSetting(tempMemory);
        addCpuNotificationSetting(tempCPU);
        addStoppedNotificationSetting(tempStopped);
      }
    });
  };

  // fetch on component mount only because of empty dependency array
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  /**
   * Checks to see if the containerId is in the array
   * @param {array} array the notification settings array (ex: memoryNotificationList)
   * @param {string} containerId the container's ID
   * @returns {number} -1 or the index of the container ID within the array
   */
  // // general function to check if a container is in a notification setting list
  // const isSelected = (set, containerId) => set.has(containerId);

  let allContainersList = props.runningList.concat(props.stoppedList); // INSTEAD OF CREATING A NEW STATE IN THE REDUCER CONCATENATED 2 ALREADY EXISTING STATES

  // const renderAllContainersList = allContainersList.map((container, i) => {
  //   //   let isMemorySelected = isSelected(
  //   //     props.memoryNotificationList,
  //   //     container.ID,
  //   //   );
  //   //   let isCpuSelected = isSelected(props.cpuNotificationList, container.ID);
  //   //   let isStoppedSelected = isSelected(
  //   //     props.stoppedNotificationList,
  //   //     container.ID,
  //   //   );
  //   // });

  //   return (
  //     <div className="renderContainers">
  //       <div className="header">
  //         <h1 className="tabTitle">Settings</h1>
  //       </div>

  //       <div className="metric-section-title">
  //         <h3>Notifications</h3>
  //       </div>
  //       <div className="settings-container">
  //         <p>
  //           Allows you (i) to customize monitoring and notification frequency
  //           and (ii) to define alert conditions for sms notifications when your
  //           container meets a condition
  //         </p>
  //         <br></br>
  //         <p>1. Link mobile phone to your account</p>
  //         <br></br>
  //         <form className={classes.root} autoComplete="off">
  //           <div>
  //             <TextField
  //               required
  //               id="textfield"
  //               label="Phone Number"
  //               helperText="* use country code (+1)"
  //               variant="outlined"
  //               value={mobileNumber}
  //               onChange={(e) => {
  //                 setMobileNumber(e.target.value);
  //                 isVerified = false;
  //               }}
  //               size="small"
  //             />
  //             {!isVerified ? (
  //               <Button
  //                 className={classes.button}
  //                 size="medium"
  //                 variant="contained"
  //                 onClick={(e) => handlePhoneNumberSubmit(e)}
  //                 endIcon={<SendIcon />}
  //               >
  //                 Verify
  //               </Button>
  //             ) : (
  //               <CheckCircleIcon
  //                 fontSize="large"
  //                 className={classes.verifiedIcon}
  //               />
  //             )}
  //           </div>
  //         </form>

  //         {showVerificationInput ? (
  //           <form className={classes.root} autoComplete="off">
  //             <div className="verification-code">
  //               <TextField
  //                 required
  //                 id="verification-code"
  //                 label="Verification code"
  //                 variant="outlined"
  //                 onChange={(e) => {
  //                   handleChange(e.target.value);
  //                 }}
  //                 size="small"
  //               />
  //               <Button
  //                 className={classes.button}
  //                 size="medium"
  //                 color="default"
  //                 variant="contained"
  //                 onClick={handleSubmit}
  //                 endIcon={<SendIcon />}
  //               >
  //                 Submit
  //               </Button>
  //             </div>
  //           </form>
  //         ) : null}

  //         <p>
  //           2. Setup / update notification criteria. Recommended values will be
  //           used by default{' '}
  //         </p>
  //         <br></br>
  //         <div>
  //           <form className={classes.root} autoComplete="off">
  //             <TextField
  //               id="textfield"
  //               label="Notification frequency, min"
  //               helperText="* 5 min is recommended"
  //               variant="outlined"
  //               value={tempNotifFreq}
  //               onChange={(e) => {
  //                 setTempNotifFreq(e.target.value);
  //               }}
  //               size="small"
  //             />
  //             <Button
  //               className={classes.button}
  //               size="medium"
  //               variant="contained"
  //               onClick={(e) => notificationFrequency(e)}
  //             >
  //               Confirm
  //             </Button>
  //           </form>
  //         </div>

  //         <div>
  //           <form className={classes.root} autoComplete="off">
  //             <TextField
  //               className={classes.textfield}
  //               id="textfield"
  //               label="Monitoring frequency, min"
  //               helperText="* 2 min is recommended"
  //               variant="outlined"
  //               value={tempMonitoringFrequency}
  //               onChange={(e) => {
  //                 setTempMonitoringFrequency(e.target.value);
  //               }}
  //               size="small"
  //             />
  //             <Button
  //               className={classes.button}
  //               size="medium"
  //               variant="contained"
  //               onClick={(e) => monitoringFrequency(e)}
  //             >
  //               Confirm
  //             </Button>
  //           </form>
  //         </div>

  //         <br></br>
  //         <p>
  //           3. Setup / update attribute values for notification triggers in
  //           Containers settings table below. Recommended values will be used by
  //           default{' '}
  //         </p>
  //         <br></br>
  //       </div>

  //       <div className="metric-section-title">
  //         <h3>GitHub commits</h3>
  //       </div>
  //       <div className="settings-container">
  //         <p>
  //           Allows you to get access to latest GitHub commits in your project
  //           repository on "Metrics" tab for selected containers
  //         </p>
  //         <br></br>
  //         <p>
  //           1. Add GitHub repositories url in Containers settingss table below
  //         </p>
  //       </div>

  //       <div className="metric-section-title">
  //         <h3> Containers setting table</h3>
  //         <p></p>
  //       </div>

  //       <div className="settings-container">
  //         <div id="description" className={classes.description}></div>

  //       </div>
  //     </div>
  //   );
  // });
  return (
    <div className="renderContainers">
      <div className="header">
        <h1 className="tabTitle">Settings</h1>
      </div>

      <div className="metric-section-title">
        <h3>Phone Registration</h3>
      </div>
      <div className="settings-container">
        <div>
          Register your mobile phone number with our SMS notification service.
        </div>
        <PhoneInput />
      </div>

      <div className="metric-section-title">
        <h3>Monitoring & Notification Frequency</h3>
      </div>
      <div className="settings-container">
        <p>
          Allows you to (i) customize the frequency at which we monitor your
          Docker container stats and (ii), customize the frequency at which we
          resend a notification for an outstanding container issue.
        </p>
        <IntervalInput />
      </div>

      <div className="metric-section-title">
        <h3>Container Settings Table </h3>
      </div>
      <div className="settings-container">
        <p>Setup the container values that will trigger SMS notifications</p>
        <ContainerSettingsTable containers={allContainersList} />
      </div>

      {/* <p>
          3. Setup / update attribute values for notification triggers in
          Containers settings table below. Recommended values will be used by
          default{' '}
        </p> */}

      <br></br>
    </div>
  );
};

export default Settings;
