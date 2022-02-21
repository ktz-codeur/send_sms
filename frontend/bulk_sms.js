import React, { useState } from "react";
import {
  useRecords,
  Input,
  Button,
  Link,
  TablePicker,
  ViewPicker,
  useBase,
  FieldPicker,
} from "@airtable/blocks/ui";
import { accountSid, authToken, phoneNumber } from "../config";

const ButtonComponent = (props) => {
  const base = useBase();
  const table = base.getTableByName(props.values.table);
  const view = table.getViewByName(props.values.view);
  const queryResult = view.selectRecords();
  const records = useRecords(queryResult);
  const [sendingProgress, setSendingProgress] = useState(null);

  function sms() {
    let message;
    let required_fields = [];
    if (props.values.message) {
      message = props.values.message;
      let positions = [];
      for (let i in message) {
        if (message[i] == "{" || message[i] == "}") {
          positions.push(parseInt(i, 10));
        }
      }
      for (let j = 0; j < positions.length; j++) {
        required_fields.push(message.slice(positions[j] + 1, positions[j + 1]));
        j++;
      }
    }
    if (message) {
      var messageObj = {
        phone: [],
        sms_text: [],
      };
      sendSms();
    }

    async function sendSms() {
      records.map((record) => {
        if (required_fields) {
          required_fields.forEach((element) => {
            if (table.getFieldByNameIfExists(element)) {
              if (messageObj[element]) {
                messageObj[element].push(record.getCellValue(element));
              } else {
                messageObj[element] = [record.getCellValue(element)];
              }
            }
          });
        }
        messageObj.phone.push(record.getCellValue(props.values.field));
        messageObj.sms_text.push(props.values.message);
      });
      for (var key in messageObj) {
        if (key != "phone" || key != "sms_text") {
          console.log(key);
          for (var k = 0; k <= messageObj[key].length; k++) {
            if (messageObj[key][k]) {
              messageObj.sms_text[k] = messageObj.sms_text[k].replace(
                "{" + key + "}",
                messageObj[key][k]
              );
            }
          }
        }
      }
      let progress = 0;
      for (let j = 0; j <= messageObj.phone.length; j++) {
        if (messageObj.phone[j]) {
          const formData = new FormData();
          formData.append("To", messageObj.phone[j]);
          formData.append("From", phoneNumber);
          formData.append("Body", messageObj.sms_text[j]);
          //formData.append("Url", "http://sheetify.aeroapps.xyz/getxml");
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
            progress++;
            setSendingProgress(progress / messageObj.phone.length);
          });
        }
      }
      setSendingProgress(null);
    }
  }

  return (
    <Button
      onClick={() => sms()}
      style={{ background: '#18BFFF'}}
    >
      {sendingProgress
        ? `Sending SMS ... (${Math.round(sendingProgress * 100)}%)`
        : "SEND "}
    </Button>
  );
};

const GetCountComponent = (props) => {
  const base = useBase();
  let records;
  base.tables.map((record) => {
    if (record.name == props.table) {
      record.views.map((views) => {
        if (views.name == props.view) {
          records = views;
        }
      });
    }
  });
  if (records) {
    return (
      <div>You will be sending {useRecords(records).length} messages 👾.</div>
    );
  } else {
    return <div>You will be sending 0 messages 👾.</div>;
  }
};

const FieldPickerComponent = (props) => {
  const [field, setField] = useState(null);
  const base = useBase();
  const table = base.getTableByNameIfExists(props.table);
  return (
    <FieldPicker
      field={field}
      table={table}
      onChange={(newField) => {
        props.onChange("field", newField.name);
        setField(newField);
      }}
      width="320px"
    />
  );
};

const ViewPickerComponent = (props) => {
  const [view, setView] = useState(null);
  const base = useBase();
  const table = base.getTableByNameIfExists(props.table);
  return (
    <ViewPicker
      table={table}
      view={view}
      onChange={(newView) => {
        props.onChange("view", newView.name);
        props.onChange("viewId", newView.id);
        setView(newView);
      }}
      width="320px"
    />
  );
};

const TablePickerComponent = (props) => {
  const [table, setTable] = useState(null);
  return (
    <TablePicker
      table={table}
      onChange={(newTable) => {
        setTable(newTable);
        props.onChange("table", newTable.name);
        props.onChange("view", "");
        props.onChange("field", "");
        props.onChange("records", []);
      }}
      width="320px"
    />
  );
};

class BULK_SMS extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      page: "",
      table: "",
      view: "",
      field: "",
      viewObj: "",
      length: "",
      records: [],
      message: "",
      button_color: "#18BFFF",
      button_text: "SEND",
    };
    this.onViewChange = this.onViewChange.bind(this);
    this.onChange = this.onChange.bind(this);
  }
  onViewChange() {
    this.props.onChange("");
  }
  onChange(key, value) {
    console.log(key + " " + value);
    this.setState({ [key]: value });
    console.log(this.state);
  }

  render() {
    let messageCount;
    let fieldPicker;
    if (this.state.view && this.state.table) {
      fieldPicker = (
        <div style={{ padding: "4px", paddingBottom: "0px" }}>
          <p>Select the field which contains the phone numbers</p>
          <FieldPickerComponent
            table={this.state.table}
            onChange={this.onChange}
          />
        </div>
      );
    }
    if (this.state.field && this.state.table && this.state.view) {
      messageCount = (
        <div>
          <GetCountComponent
            table={this.state.table}
            view={this.state.view}
            onChange={this.onChange}
          />
          <textarea
            style={{ width: "320px", marginTop: "4px" }}
            rows="5"
            type="text"
            value={this.state.message}
            onChange={(e) => this.onChange("message", e.target.value)}
            name="message"
            placeholder="Enter message here, you can include fields by using {field-name}."
          />
        </div>
      );
    }
    let buttonComponent;
    if (this.state.field && this.state.table && this.state.view) {
      buttonComponent = (
        <ButtonComponent values={this.state} onChange={this.onChange} />
      );
    }

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
        <div style={{ textAlign: "center" }}>
          <h4>Send Multiple SMS</h4>
          <TablePickerComponent onChange={this.onChange} />
          <div style={{ padding: "4px", paddingBottom: "0px" }}>
            <ViewPickerComponent
              table={this.state.table}
              onChange={this.onChange}
            />
          </div>
          {fieldPicker}
          <div style={{ padding: "8px", paddingBottom: "0px" }}>
            {messageCount}
          </div>
          <div style={{ padding: "8px", paddingBottom: "0px" }}>
            {buttonComponent}
          </div>
        </div>
      </div>
    );
  }
}
export default BULK_SMS;
