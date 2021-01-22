import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ipcRenderer } from "electron";
import * as actions from "../../../actions/actions";
import query from "../../helper/psqlquery";
import * as queryType from "../../../constants/queryTypes";
import TextField from "@material-ui/core/TextField";
import SendIcon from "@material-ui/icons/Send";
import VerifiedUserIcon from "@material-ui/icons/VerifiedUser";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import Button from "@material-ui/core/Button";
import { makeStyles } from "@material-ui/core/styles";

// showVerificationInput IS ISED FOR RENDERING THE VERIFICATION CODE COMPONENT
let showVerificationInput = false;
let isVerified = false;

const PhoneInput = ({ styles }) => {
  const mobileNumber = useSelector(
    (state) => state.notificationList.phoneNumber
  );
  const [verificationCode, setVerificationCode] = useState("");

  const dispatch = useDispatch();
  const setMobileNumber = (data) => dispatch(actions.addPhoneNumber(data));

  const getMobileNumber = async () => {
    const phone = await query(
      `select phone_number, phone_verified from users;`,
      []
    );

    setMobileNumber({
      mobile: phone.rows.length ? phone.rows[0].phone_number : "",
      isVerified: phone.rows.length ? phone.rows[0].phone_verified : false,
    });
  };

  useEffect(() => {
    getMobileNumber();
  }, []);

  /**
   * alerts if phone not entered on Test click
   */
  const submitMobileNumber = () => {
    if (!mobileNumber.mobile) alert("Please enter phone number");
    else {
      // alert if input is not a number
      if (isNaN(Number(mobileNumber.mobile)))
        alert("Please enter phone number in numerical format. ex: 123456789");
      else {
        alert(`Phone: ${mobileNumber.mobile} is valid`);
        // ask SMS service for a verification code
        query(
          queryType.INSERT_USER,
          ["admin", mobileNumber.mobile, false, 5, 2], // TODO: don't insert intervals here!!
          (err, res) => {
            if (err) {
              console.log(`Error in insert user. Error: ${err}`);
            } else {
              console.log(`*** Inserted ${res} into users table. ***`);
              setMobileNumber({
                mobile: mobileNumber.mobile,
                isVerified: false,
              });
              showVerificationInput = true;
              // ask SMS service for a verification code
              verifyMobileNumber();
            }
          }
        );
      }
    }
  };

  const savePhoneVerified = async (bool) => {
    await query(
      `INSERT INTO users (username, phone_verified)
    VALUES ($1, $2)
    ON CONFLICT ON CONSTRAINT unique_username
    DO
      UPDATE SET phone_verified = $2; `,
      ["admin", bool]
    );

    setMobileNumber({ mobile: mobileNumber.mobile, isVerified: bool });
  };

  const submitVerificationCode = async () => {
    const body = {
      code: verificationCode,
      mobileNumber: mobileNumber.mobile,
    };

    const result = await ipcRenderer.invoke("verify-code", body);

    if (result === "approved") {
      showVerificationInput = false;
      savePhoneVerified(true);
    } else alert("Please try verification code again");
  };

  const verifyMobileNumber = async () => {
    await ipcRenderer.invoke("verify-number", mobileNumber.mobile);
  };

  const classes = styles();

  return (
    <div>
      <div className={classes.description}>
        Register your mobile phone number with our SMS notification service.
        This will allow you to receive alerts based on the container
        notification rules you define below.
      </div>
      <form className={classes.root} autoComplete="off">
        <div>
          <TextField
            required
            id="textfield"
            label="Phone Number"
            helperText="* use country code (+1)"
            variant="outlined"
            value={mobileNumber.mobile}
            onChange={(e) => {
              setMobileNumber({
                mobile: e.target.value,
                isVerified: false,
              });
            }}
            size="small"
          />
          {!mobileNumber.isVerified ? (
            <Button
              className={classes.button}
              size="medium"
              variant="contained"
              onClick={(e) => submitMobileNumber(e)}
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
              label="Verification Code"
              variant="outlined"
              onChange={(e) => {
                setVerificationCode(e.target.value);
              }}
              onBlur={(e) => {
                setVerificationCode(e.target.value);
              }}
              value={verificationCode}
              size="small"
            />
            <Button
              className={classes.button}
              size="medium"
              color="default"
              variant="contained"
              onClick={submitVerificationCode}
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
