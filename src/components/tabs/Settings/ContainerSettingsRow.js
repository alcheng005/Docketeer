import React, { useEffect, useState } from "react";
import query from "../../helper/psqlquery";
import * as queryType from "../../../constants/queryTypes";
import * as categories from "../../../constants/notificationCategories";
import TableRow from "@material-ui/core/TableRow";
import TableCell from "@material-ui/core/TableCell";
import Checkbox from "@material-ui/core/Checkbox";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import { makeStyles } from "@material-ui/core/styles";

const ContainerSettingsRow = ({
  container,
  isMemoryChecked,
  isCpuChecked,
  isStoppedChecked,
  // gitHubURL,
}) => {
  const [gitHubURL, setGitHubURL] = useState("");
  //"https://api.github.com/repos/oslabs-beta/Docketee/commits?"

  const getGitHubURL = async () => {
    let url = await query(`select github_url from containers where id = $1`, [
      container.ID,
    ]);
    console.log(url.rows[0].github_url);
    setGitHubURL(url.rows[0].github_url || "");
  };

  useEffect(() => {
    getGitHubURL();
  }, []);

  const useStyles = makeStyles((theme) => ({
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

  const classes = useStyles();

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

  const saveSettings = () => {
    // Docker returns Names for stopped containers vs Name for running
    if (!gitHubURL)
      alert("Please provide a link in accordance with provided example");
    if (!container.ID) alert("Please provide a container ID");
    else {
      query(
        queryType.INSERT_GITHUB,
        [container.ID, container.Names || container.Name, gitHubURL],
        (err, res) => {
          if (err) {
            console.log(`INSERT_GITHUB. Error: ${err}`);
          } else {
            console.log(`*** Inserted ${res} into containers table. ***`);
          }
        }
      );
    }
  };

  return (
    <TableRow>
      <TableCell>
        <span className="container-name">
          {container.Names ? container.Names : container.Name}
          {/* Stopped containers have a .Names key. Running containers have a .Name key */}
        </span>
      </TableCell>
      <TableCell>
        <span className="container-id">{container.ID}</span>
      </TableCell>
      <TableCell>{container.Image}</TableCell>
      <TableCell align="center">
        <Checkbox
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
          checked={isMemoryChecked}
        />
      </TableCell>
      <TableCell align="center">
        <Checkbox
          onClick={(event) =>
            event.target.checked
              ? handleCheckSetting(container.ID, container.Name, categories.CPU)
              : handleUnCheckSetting(container.ID, categories.CPU)
          }
          role="checkbox"
          key={container.ID}
          checked={isCpuChecked}
        />
      </TableCell>
      <TableCell align="center">
        <Checkbox
          onClick={(event) =>
            event.target.checked
              ? handleCheckSetting(
                  container.ID,
                  container.Names ? container.Names : container.Name, // Stopped containers have a .Names key. Running containers have a .Name key
                  categories.STOPPED
                )
              : handleUnCheckSetting(container.ID, categories.STOPPED)
          }
          role="checkbox"
          key={container.ID}
          checked={isStoppedChecked}
        />
      </TableCell>
      <TableCell align="center">
        <TextField
          className={classes.textfield}
          id="gitHub-URL"
          label="Main Repository URL"
          helperText="* e.g.: https://api.github.com/repos/oslabs-beta/Docketeer/commits?"
          variant="outlined"
          value={gitHubURL}
          onChange={(e) => {
            setGitHubURL(e.target.value);
          }}
          onBlur={(e) => {
            setGitHubURL(e.target.value);
          }}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Button
          className={classes.button}
          size="small"
          variant="contained"
          id={`saveBtn-${container.ID}`}
          onClick={() => saveSettings()}
        >
          SAVE
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default ContainerSettingsRow;
