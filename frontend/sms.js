import React, { useState} from "react";
import { FormField, Input, Button, Link } from "@airtable/blocks/ui";
import { accountSid, authToken, phoneNumber } from "../config";

const ButtonComponent = (props) => {
  async function onButtonClick(message, toNumber, fromNumber) {
    props.onChange("button_text", "SENDING...");
    props.onChange("button_color", "#99a4a9");
    const formData = new FormData();
    formData.append("To", toNumber);
    formData.append("From", fromNumber);
    formData.append("Body", message);
    await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        body: formData,
        headers: {
          Authorization: "Basic " + btoa(`${accountSid}:${authToken}`),
        },
      }
    ).then((res) => {
      if (res.ok) {
        props.onChange("button_text", "MESSAGE SENT");
        props.onChange("button_color", "#387d04");
        setTimeout(() => setErrors(), 2500);
      } else {
        props.onChange("button_text", "ERROR SENDING");
        props.onChange("button_color", "#ff1812");
        setTimeout(() => setErrors(), 2500);
      }
    });
  }
  function setErrors() {
    props.onChange("button_text", "SEND");
    props.onChange("button_color", "#18BFFF");
    props.onChange("number", "+91");
    props.onChange("message", "");
  }
  return (
    <div style={{ padding: "4px" }}>
      <Button
        onClick={() =>
          onButtonClick(props.message, props.toNumber, phoneNumber)
        }
        variant="primary"
        size="small"
        style={{ background: props.button_color }}
      >
        {props.button_text}
      </Button>
    </div>
  );
};

class FormFieldComponent extends React.Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }
  onChange(key, value) {
    this.props.onChange(key, value);
  }
  render() {
    return (
      <FormField label={this.props.label}>
        <Input
          value={this.props.value}
          onChange={(e) =>
            this.onChange(this.props.label.toLowerCase(), e.target.value)
          }
        />
      </FormField>
    );
  }
}

class SMS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      number: "+91",
      message: "",
      button_color: "#18BFFF",
      button_text: "SEND",
    };
    this.onChange = this.onChange.bind(this);
    this.onViewChange = this.onViewChange.bind(this);
    this.onSend = this.onButtonClick.bind(this);
    
  }
  onViewChange(){
      this.props.onChange("")
  }
  onChange(key, value) {
    console.log(key + " " + value);
    this.setState({ [key]: value });
  }
  onButtonClick() {}
  render() {
    return (
      <div style={{ padding: "10px" }}>
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault();
            this.onViewChange();
          }}
          target="_blank"
        >
          Back
        </Link>
        <h4>Send SMS</h4>
        <FormFieldComponent
          label={"Number"}
          value={this.state.number}
          onChange={this.onChange}
        />
        <FormFieldComponent
          label={"Message"}
          value={this.state.message}
          onChange={this.onChange}
        />
        <ButtonComponent
          message={this.state.message}
          toNumber={this.state.number}
          button_text={this.state.button_text}
          button_color={this.state.button_color}
          onChange={this.onChange}
          onViewChange={this.onViewChange}
        />
      </div>
    );
  }
}
export default SMS;
