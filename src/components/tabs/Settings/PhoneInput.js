import React, { useState } from "react";
import { ipcRenderer } from "electron";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

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

// showVerificationInput IS ISED FOR RENDERING THE VERIFICATION CODE COMPONENT
let showVerificationInput = false;
let isVerified = false;

const PhoneInput = () => {
  const [mobileNumber, setMobileNumber] = useState("");
  const classes = useStyles();

  return (
    <div>
      <div>1. Link mobile phone to your account</div>
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
    </div>
  );
};

export default PhoneInput;
