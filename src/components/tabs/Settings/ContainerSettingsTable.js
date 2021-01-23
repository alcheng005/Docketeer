/* eslint-disable react/prop-types */
import React from "react";
import { useSelector } from "react-redux";
import Table from "@material-ui/core/Table";
import TableRow from "@material-ui/core/TableRow";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import ContainerSettingsRow from "./ContainerSettingsRow";

const ContainerSettingsTable = ({ containers, styles }) => {
  const memoryNotificationList = useSelector(
    (state) => state.notificationList.memoryNotificationList
  );
  const cpuNotificationList = useSelector(
    (state) => state.notificationList.cpuNotificationList
  );
  const stoppedNotificationList = useSelector(
    (state) => state.notificationList.stoppedNotificationList
  );

  const classes = styles();

  const rows = containers.map((container) => {
    return (
      <ContainerSettingsRow
        key={container.ID}
        container={container}
        isMemoryChecked={memoryNotificationList.has(container.ID)}
        isCpuChecked={cpuNotificationList.has(container.ID)}
        isStoppedChecked={stoppedNotificationList.has(container.ID)}
      />
    );
  });

  return (
    <div>
      <p className={classes.description}>
        Select the container metric values that should trigger SMS
        notifications.
      </p>

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{"Container Name"}</TableCell>
              <TableCell>{"Container ID"}</TableCell>
              <TableCell>{"Image"}</TableCell>
              <TableCell align="center">{"Memory > 80%"}</TableCell>
              <TableCell align="center">{"CPU > 80%"}</TableCell>
              <TableCell align="center">{"Container Stops"}</TableCell>
              <TableCell align="center">{"GitHub Repository URL"}</TableCell>
              <TableCell align="center">{"Apply Settings"}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{rows}</TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default ContainerSettingsTable;
