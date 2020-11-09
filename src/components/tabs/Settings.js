import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import * as actions from "../../actions/actions";
import { ipcRenderer } from "electron";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import * as categories from "../../constants/notificationCategories";
import query from "../helper/psqlQuery";
import * as queryType from "../../constants/queryTypes";
import { makeStyles } from "@material-ui/core/styles";
import SendIcon from "@material-ui/icons/Send";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { useSelector, useDispatch } from "react-redux";

const mapDispatchToProps = (dispatch) => ({
  addPhoneNumber: (data) => dispatch(actions.addPhoneNumber(data)),
  addNotificationFrequency: (data) => dispatch(actions.addNotificationFrequency(data)),
  addMonitoringFrequency: (data) => dispatch(actions.addMonitoringFrequency(data)),
  addMemoryNotificationSetting: (data) =>
    dispatch(actions.addMemoryNotificationSetting(data)),
  addCpuNotificationSetting: (data) =>
    dispatch(actions.addCpuNotificationSetting(data)),
  addStoppedNotificationSetting: (data) =>
    dispatch(actions.addStoppedNotificationSetting(data)),
  removeMemoryNotificationSetting: (data) =>
    dispatch(actions.removeMemoryNotificationSetting(data)),
  removeCpuNotificationSetting: (data) =>
    dispatch(actions.removeCpuNotificationSetting(data)),
  removeStoppedNotificationSetting: (data) =>
    dispatch(actions.removeStoppedNotificationSetting(data)),    
});

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiTextField-root': {
      // margin: theme.spacing(1),
      marginLeft: 5,
      marginBottom: 15,
      width: 220,
      verticalAlign: 'middle',
    },
  },
  button: {
    marginLeft: 5,
    width: 100,
    verticalAlign: 'top',
  },
  verifiedIcon: {
    verticalAlign: 'top',
    //marginTop: 8,
    color: 'green',
  },
  description: {
    marginLeft: 5,
    marginBottom: 30,
  },
}));

// showVerificationInput IS ISED FOR RENDERING THE VERIFICATION CODE COMPONENT
let showVerificationInput = false;
let isVerified = false;

const Settings = (props) => {
  const [mobileNumber, setMobileNumber] = useState("");
  const classes = useStyles();
  // handle check
  // I couldve made this a single function where queryType gets passed in
  // but the query's parameters are not the same
  const handleCheckSetting = (containerId, containerName, metricName) => {
    // add to DB
    query(
      queryType.INSERT_CONTAINER,
      [containerId, containerName],
      (err, res) => {
        if (err) {
          console.log(`Error in INSERT_CONTAINER. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log("** INSERT_CONTAINER returned: **", res);
        }
      }
    );

    query(
      queryType.INSERT_CONTAINER_SETTING,
      [containerId, metricName.toLowerCase()],
      (err, res) => {
        if (err) {
          console.log(`Error in INSERT_CONTAINER_SETTING. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log("** INSERT_CONTAINER_SETTING returned: **", res);
        }
      }
    );
  };

  // handle uncheck
  // remove from DB
  const handleUnCheckSetting = (containerId, metricName) => {
    // add to DB
    query(
      queryType.DELETE_CONTAINER_SETTING,
      [containerId, metricName.toLowerCase()],
      (err, res) => {
        if (err) {
          console.log(`Error in DELETE_CONTAINER_SETTING. Error: ${err}`);
        } else {
          // if all good, call fetchNotificationSettings
          fetchNotificationSettings();
          console.log("** DELETE_CONTAINER_SETTING returned: **", res);
        }
      }
    );
  };

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

        res.rows.forEach((el, i) => {
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
        props.addMemoryNotificationSetting(tempMemory);
        props.addCpuNotificationSetting(tempCPU);
        props.addStoppedNotificationSetting(tempStopped);

        console.log("** Settings returned: **", res.rows);
      }
    });
  };

  const verifyMobileNumber = async () => {
    await ipcRenderer.invoke("verify-number", mobileNumber);
  };

  // fetch on component mount only because of empty dependency array
  useEffect(() => {
    fetchNotificationSettings();
  }, []);

  /**
   * alerts if phone not entered on Test click
   */
  const handlePhoneNumberSubmit = () => {
    if (!mobileNumber) alert("Please enter phone number");
    else {
      // alert if input is not a number
      if (isNaN(Number(mobileNumber)))
        alert("Please enter phone number in numerical format. ex: 123456789");
      else {
        alert(`Phone: ${mobileNumber} is valid`);
        // ask SMS service for a verification code
        query(queryType.INSERT_USER, ["admin", mobileNumber, 5, 2], (err, res) => {     // ADDED 2 COMMAS AFTER MOBILENUMBER -> MAKE SURE THAT IT WORKS
          if (err) {
            console.log(`Error in insert user. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into users table. ***`);
            props.addPhoneNumber(mobileNumber);
            showVerificationInput = true;
            // ask SMS service for a verification code
            verifyMobileNumber();
          }
        });
      }
    }
  };

// SAVING USER INPUTS: NOTIFICATION AND MEMORY CYCLE 
  // 1. GET DATA FROM THE FORM
  // 2. MAKE SURE THAT IT HAS THE RIGHT FORMAT
  // 3. SEND IT TO DATABASE
  // 4. THEN UPDATE THE STATE
const notificationState = useSelector((state) => state.notificationList.notificationFrequency);
const [tempNotifFreq, setTempNotifFreq] = useState('');
const notificationFrequency = () => {
              // default value for Notification Frequency
              let frequency = 5
              // alert if input is not a number
              if (isNaN(Number(tempNotifFreq))) alert('Please enter notification frequency in numerical format. ex: 15');
              else {
                if (tempNotifFreq) frequency = tempNotifFreq
                  query(
                    queryType.INSERT_NOTIFICATION_FREQUENCY,
                    ['admin', , frequency, ,],
                    (err, res) => {
                      if (err) {
                        console.log(`INSERT_NOTIFICATION_FREQUENCY. Error: ${err}`);
                      } else {
                        console.log(`*** Inserted ${res} into users table. ***`);
                        props.addNotificationFrequency(frequency);
                        // console.log("global state after state update: ", notificationState)
                      }
                    },
                  );
              }
};

const [tempMonitoringFrequency, setTempMonitoringFrequency] = useState('');
const monitoringFrequency = () => {
              // default value for Monitoring Frequency
              let frequency = 2
              // alert if input is not a number
              if (isNaN(Number(tempMonitoringFrequency))) alert('Please enter monitoring frequency in numerical format. ex: 15');
              else {
                if (tempMonitoringFrequency) frequency = tempMonitoringFrequency
                 query(
                  queryType.INSERT_MONITORING_FREQUENCY,
                  ['admin', , , frequency,],
                  (err, res) => {
                    if (err) {
                      console.log(`INSERT_MONITORING_FREQUENCY. Error: ${err}`);
                    } else {
                      console.log(`*** Inserted ${res} into users table. ***`);
                      props.addMonitoringFrequency(frequency);
                      // console.log("global state after state update: ", props.monitoringFrequency)           
                    }
                  },
                );
              }
};

  // VERIFICATION OF THE CODE TYPED IN BY USER FROM SMS
  const [formData, updateFormData] = useState("");
  const handleChange = (value) => {
    updateFormData(value);
  };

  // Verify code
  const handleSubmit = async () => {
    console.log("submitted code");

    const body = {
      code: formData,
      mobileNumber: mobileNumber,
    };

    const result = await ipcRenderer.invoke("verify-code", body);

    console.log("successfully verified code", result);

    if (result === "approved") {
      showVerificationInput = false;
      isVerified = result === "approved" ? true : false;
    } else alert("Please try verification code again");
  };

  /**
   * Checks to see if the containerId is in the array
   * @param {array} array the notification settings array (ex: memoryNotificationList)
   * @param {string} containerId the container's ID
   * @returns {number} -1 or the index of the container ID within the array
   */
  // general function to check if a container is in a notification setting list
  const isSelected = (set, containerId) => set.has(containerId);

  // INSTEAD OF CREATING A NEW STATE IN THE REDUCER CONCATENATED 2 ALREADY EXISTING STATES
  let allContainersList = props.runningList.concat(props.stoppedList)
  const renderAllContainersList = allContainersList.map((container, i) => {
    let isMemorySelected = isSelected(
      props.memoryNotificationList,
      container.ID
    );
    let isCpuSelected = isSelected(props.cpuNotificationList, container.ID);
    let isStoppedSelected = isSelected(
      props.stoppedNotificationList,
      container.ID
    );

    return (
      <TableRow key={i}>
        <TableCell>
          <span className="container-name">{container.Name}</span>
        </TableCell>
        <TableCell>
          <span className="container-id">{container.ID}</span>
        </TableCell>
        <TableCell>{container.img}</TableCell>
        <TableCell align="center">
          {/* <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                    container.ID,
                    container.Name,
                    categories.MEMORY
                  )
                : handleUnCheckSetting(container.ID, categories.MEMORY)
            }
            role="checkbox"
            key={container.ID}
            checked={isMemorySelected}
          /> */}
          <TextField
                className={classes.textfield}
                id="textfield"
                label="Attribute value, %"
                helperText="* 80% is recommended"
                variant="outlined"
                value={tempMonitoringFrequency}
                  onChange={(e) => {
                    setTempMonitoringFrequency(e.target.value);
                    console.log(tempMonitoringFrequency);
                  }}
                  size="small"
              />
        </TableCell>
        <TableCell align="center">
          {/* <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                    container.ID,
                    container.Name,
                    categories.CPU
                  )
                : handleUnCheckSetting(container.ID, categories.CPU)
            }
            role="checkbox"
            key={container.ID}
            checked={isCpuSelected}
          /> */}
                    <TextField
                className={classes.textfield}
                id="textfield"
                label="Hurdle rate, %"
                helperText="* 80% is recommended"
                variant="outlined"
                value={tempMonitoringFrequency}
                  onChange={(e) => {
                    setTempMonitoringFrequency(e.target.value);
                    console.log(tempMonitoringFrequency);
                  }}
                  size="small"
              />
        </TableCell>
        <TableCell align="center">
          <Checkbox
            onClick={(event) =>
              event.target.checked
                ? handleCheckSetting(
                    container.ID,
                    container.Name,
                    categories.STOPPED
                  )
                : handleUnCheckSetting(container.ID, categories.STOPPED)
            }
            role="checkbox"
            key={container.ID}
            checked={isStoppedSelected}
          />
        </TableCell>
        <TableCell align="center">
                    <TextField
                className={classes.textfield}
                id="textfield"
                label="Main repository url"
                helperText="* e.g.: https://github.com/comRepo/projectRepo"
                variant="outlined"
                value={tempMonitoringFrequency}
                  onChange={(e) => {
                    setTempMonitoringFrequency(e.target.value);
                    console.log(tempMonitoringFrequency);
                  }}
                  size="small"
              />
        </TableCell>
        <TableCell>
          <Button
            className={classes.button}
            size="medium"
            variant="contained"
            onClick={(e) => monitoringFrequency(e)}
          >
            Confirm
          </Button>
        </TableCell>
      </TableRow>
    );
  });
  return (
    <div className="renderContainers">
      <div className="header">
        <h1 className="tabTitle">Settings</h1>
      </div>
      
      <div className="metric-section-title">
        <h3>Notifications</h3>
      </div>
      <div className="settings-container">
          <p>Allows you (i) to customize monitoring and notification frequency and (ii) to define alert conditions for sms notifications when your container meets a condition</p>
          <br></br>
          <p>1. Link mobile phone to your account</p> 
          <br></br>
          <form className={classes.root} autoComplete="off">
              <div>
                <TextField
                  required
                  id="textfield"
                  label="Phone Number"
                  helperText="* use country code (+1)"
                  variant="outlined"
                  value={mobileNumber}
                  onChange={(e) => {
                    setMobileNumber(e.target.value);
                    console.log(mobileNumber);
                    isVerified = false;
                  }}
                  size="small"
                />
                {!isVerified ? (
                  <Button
                    className={classes.button}
                    size="medium"
                    variant="contained"
                    onClick={(e) => handlePhoneNumberSubmit(e)}
                    endIcon={<SendIcon />}
                  >
                    Verify
                  </Button>
                ) : (
                  <CheckCircleIcon
                    fontSize="large"
                    className={classes.verifiedIcon}
                  />
                )}
              </div>
            </form>

            {showVerificationInput ? (
          <form className={classes.root} autoComplete="off">
            <div className="verification-code">
              <TextField
                required
                id="verification-code"
                label="Verification code"
                variant="outlined"
                onChange={(e) => {
                  handleChange(e.target.value);
                }}
                size="small"
              />
              <Button
                className={classes.button}
                size="medium"
                color="default"
                variant="contained"
                onClick={handleSubmit}
                endIcon={<SendIcon />}
              >
                Submit
              </Button>
            </div>
          </form>
        ) : null}
            
          <p>2. Setup / update notification criteria. Recommended values will be used by default </p> 
          <br></br>
          <div>
            <form className={classes.root} autoComplete="off">
              <TextField
                id="textfield"
                label="Notification frequency, min"
                helperText="* 5 min is recommended"
                variant="outlined"
                value={tempNotifFreq}
                  onChange={(e) => {
                    setTempNotifFreq(e.target.value);
                    console.log(tempNotifFreq);
                  }}
                  size="small"
              />
              <Button
                className={classes.button}
                size="medium"
                variant="contained"
                onClick={(e) => notificationFrequency(e)}
              >
                Confirm
              </Button>
            </form>
          </div>

          <div>
            <form className={classes.root} autoComplete="off">
              <TextField
                className={classes.textfield}
                id="textfield"
                label="Monitoring frequency, min"
                helperText="* 2 min is recommended"
                variant="outlined"
                value={tempMonitoringFrequency}
                  onChange={(e) => {
                    setTempMonitoringFrequency(e.target.value);
                    console.log(tempMonitoringFrequency);
                  }}
                  size="small"
              />
              <Button
                className={classes.button}
                size="medium"
                variant="contained"
                onClick={(e) => monitoringFrequency(e)}
              >
                Confirm
              </Button>
            </form>
          </div>

          <br></br>
          <p>3. Setup / update attribute values for notification triggers in Containers settings table below. Recommended values will be used by default </p> 
          <br></br>

      </div>

      <div className="metric-section-title">
        <h3>GitHub commits</h3>
      </div>
      <div className="settings-container">
          <p>Allows you to get access to latest GitHub commits in your project repository on "Metrics" tab for selected containers</p>
          <br></br>
          <p>1. Add GitHub repositories url in Containers settings table below</p>
      </div>


      <div className="metric-section-title">
        <h3> Containers setting table</h3>
        <p></p>
      </div>

      <div className="settings-container">
        <div id="description" className={classes.description}>
        </div>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Container Name</TableCell>
                <TableCell>Container ID</TableCell>
                <TableCell>Image</TableCell>
                <TableCell align="center">Memory exceeds attribute value</TableCell>
                <TableCell align="center">CPU exceeds attribute value</TableCell>
                <TableCell align="center">Container Stops</TableCell>
                <TableCell align="center">GitHub repository url</TableCell>
                <TableCell align="center">Apply settings</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {renderAllContainersList}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </div>
  );
};


export default connect(null, mapDispatchToProps)(Settings);
