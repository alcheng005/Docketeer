/* eslint-disable react/prop-types */
import React, { useState } from "react";
import * as helper from "../helper/commands";
import { Bar } from "react-chartjs-2";
import ToggleDisplay from "../display/ToggleDisplay";

/**
 * 
 * @param {*} props 
 * Display Running container
 */
const Running = (props) => {

  const [run, setRun] = useState("");

  const handleClick = (e) => {
    e.preventDefault();
    props.runIm(run, props.runningList, helper.addRunning, props.addRunningcontainer);
  };

  let renderRunningList = props.runningList.map((container, i) => {
    let cpuData = parseFloat(
      
      // container["CPUPerc"].substring(0, container["CPUPerc"].length - 1)
      container.CPUPerc.substring(0, container.CPUPerc.length - 1)
    ).toFixed(2);
    let memoryData = parseFloat(
      // container["MemPerc"].substring(0, container["mp"].length - 1)
      container.MemPerc.substring(0, container.MemPerc.length - 1)
    ).toFixed(2);
    const stack = "stack";
    const chartInfo = {
      labels: ["CPU", "Memory"],
      datasets: [
        {
          stack,
          label: Math.random(),
          backgroundColor: ["rgba(44, 130, 201, 1)", "rgba(19, 221, 29, 1)"],
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 1,
          data: [cpuData, memoryData],
          barPercentage: 0.4,
        },
        {
          stack,
          label: Math.random(),
          backgroundColor: ["rgba(155, 198, 233, 1)", "rgba(217, 252, 219, 1)"],
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 1,
          data: [(100 - cpuData).toFixed(2), (100 - memoryData).toFixed(2)],
          barPercentage: 0.4,
        },
      ],
    };

    return (
      <div className="box box-running" key={`runningBox${i}`}>
        <div className="box-label">
          <h3>{container.Name}</h3>
          <p>{container.ID}</p>
        </div>
        <div className="box-info">
          <div className="chart">
            <div className="chart-label">
              <div className="chart-label-container">
                <div className="cpuBox"></div>
                <div>
                  <span className="chart-label-text">{cpuData}%</span>
                </div>
              </div>
              <div className="chart-label-container">
                <div className="memoryBox"></div>
                <div>
                  <span className="chart-label-text">{memoryData}%</span>
                </div>
              </div>
            </div>
            <div className="chart-info">
              <Bar
                data={chartInfo}
                options={{
                  tooltips: {
                    enabled: false,
                  },
                  title: {
                    display: false,
                  },
                  legend: {
                    display: false,
                    position: "right",
                  },

                  scales: {
                    yAxes: [
                      {
                        gridLines: {
                          display: false,
                        },
                        ticks: {
                          display: false,
                          min: 0,
                          max: 100,
                          stepSize: 20,
                        },
                      },
                    ],
                    xAxes: [
                      {
                        //barPercentage: 0.4,
                        categorySpacing: 0,
                      },
                    ],
                  },
                }}
              />
            </div>
          </div>
          <ToggleDisplay container={container} />
        </div>
        <div className="box-button box-button-running">
          <button
            className="stop-btn"
            onClick={() => props.stop(container.ID, props.stopRunningContainer)}
          >
            STOP
          </button>
        </div>
      </div>
    );
  });

  return (
    <div className="renderContainers">
      <div className="header">
        <span className="tabTitle">Running container</span>
        <div className="runByButton">
          <label>Enter Image ID or Repo</label>
          <span>
            <input
              type="text"
              value={run}
              onChange={(e) => {
                setRun(e.target.value);
              }}
            ></input>
          </span>
          <button className="run-btn" onClick={(e) => handleClick(e)}>
            Run
          </button>
        </div>
      </div>
      <div className="containers">{renderRunningList}</div>
    </div>
  );
};

export default Running;
