import React from "react";
import { initializeBlock, Button } from "@airtable/blocks/ui";
import { accountSid, authToken, phoneNumber } from "../config";
import SMS from "./sms";
import BULK_SMS from "./bulk_sms"
import BULK_CALL from "./bulk_call"
import CALL from "./call"
const TaskComponent  = (props) => {
  switch (props.task) {
    case "sms":
      return <SMS onChange = {props.onChange}/>;
    case "bulk_sms":
        return <BULK_SMS onChange ={props.onChange} />
    case "call":
        return <CALL onChange ={props.onChange} />
    case "bulk_call":
        return <BULK_CALL onChange ={props.onChange} />
  }
};

const ButtonComponent = (props) => {
  function onButtonClick(value) {
    props.onChange(value);
  }
  return (
    <div style={{ padding: "4px" }}>
      <Button
        onClick={() => onButtonClick(props.value)}
        variant="primary"
        size="small"
        icon = {props.icon}
      >
        {props.buttonText}
      </Button>
    </div>
  );
};

class WelcomeBlock extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      task: "",
      page: "",
    };
    this.onChange = this.onChange.bind(this);
  }
  onChange(value) {
    this.setState({ task: value });
  }

  render() {
    let task = this.state.task;
    if (
      accountSid != "" &&
      authToken != "" &&
      phoneNumber != "" &&
      task == ""
    ) {
      return (
        <div style={{ textAlign: "center" }}>
          <h3>Welcome to Tely 📱</h3>
          <div>What would you like to do?</div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
              marginTop: "10px",
            }}
          >
            <ButtonComponent
              buttonText={"Send an SMS"}
              value={"sms"}
              onChange={this.onChange}
              icon = {"envelope"}
            />
            <ButtonComponent
              buttonText={"Send multiple SMS"}
              value={"bulk_sms"}
              onChange={this.onChange}
              icon = {"envelope"}
            />
            <ButtonComponent
              buttonText={"Send a Voice message"}
              value={"call"}
              onChange={this.onChange}
              icon = {"radioSelected"}
            />
            <ButtonComponent
              buttonText={"Send multiple Voice messages"}
              value={"bulk_call"}
              onChange={this.onChange}
              icon = {"radioSelected"}
            />
          </div>
        </div>
      );
    } else if (
      accountSid != "" &&
      authToken != "" &&
      phoneNumber != "" &&
      task != ""
    ) {
      return <TaskComponent task={task} onChange={this.onChange} />;
    } else {
      return (
        <div style={{ textAlign: "center" }}>
          <h3>Welcome to Tely 📱</h3>
          <div>
            🏃‍♀️ To start using Tely, add your twilio credentials to the
            config.json file.
          </div>
        </div>
      );
    }
  }
}

initializeBlock(() => <WelcomeBlock />);
