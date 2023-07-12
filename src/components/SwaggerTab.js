import React, { useState, useEffect, useRef } from "react";
import { Table, Divider, Spin, Input, Button, Form } from "antd";
import SecurityDefinitions from "./SecurityDefinitions";
import PathsDropdown from "./PathsDropdown";
import { useQuery } from "react-query";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { solarizedlight } from "react-syntax-highlighter/dist/esm/styles/prism";
import SwaggerRequestForm from "./SwaggerRequestForm";
import { shallow } from "zustand/shallow";
import { Collapse } from "antd";
import axios from "axios";
import { findUrl } from "../utils/url";
import { useSwaggerStore } from "../store/swaggerStore";
import { useOAuth2Token, OAuthCallback } from "react-oauth2-hook";
import { BrowserRouter as Router, Switch } from "react-router-dom";

const { Panel } = Collapse;

const columns = [
  {
    title: "Path",
    dataIndex: "path",
    key: "path",
  },
  {
    title: "Description",
    dataIndex: "description",
    key: "description",
  },
  {
    title: "HTTP Verb",
    dataIndex: "verb",
    key: "verb",
  },
];

const SwaggerRequestForms = ({
  selectedPaths,
  paths,
  baseUrl,
  schemas,
  authHeader,
  getSecurityDefinitionForPath,
}) => {
  return (
    <>
      {selectedPaths.map((path) => {
        const [verb, selectedPath] = path.split(":");
        const pathDetails = paths.find(
          (obj) => obj.path === selectedPath && obj.verb === verb
        );
        getSecurityDefinitionForPath(selectedPath);
        return (
          <div key={path}>
            <h3>{path}</h3>
            <SwaggerRequestForm
              parameters={pathDetails.object.parameters}
              baseUrl={baseUrl}
              verb={verb}
              selectedPath={selectedPath}
              schemas={schemas}
              authHeader={authHeader}
            />
          </div>
        );
      })}
    </>
  );
};

const SwaggerTab = ({ swaggerData }) => {
  const [securityDefinition, setSecurityDefinition] = useState("");

  const {
    swagger,
    selectedPaths,
    paths,
    dataSource,
    mainPath,
    swaggerLink,
    authPath,
    apiKey,
    authHeader,
  } = useSwaggerStore((state) => {
    return { ...state };
  }, shallow);
  const {
    setSelectedPaths,
    setMainPath,
    setAuthPath,
    setApiKey,
    setAuthHeader,
    setSwaggerStore,
  } = useSwaggerStore();

  const [securityDefinitionInput, setSecurityDefinitionInput] = useState("");
  const [securityDefinitionPath, setSecurityDefinitionPath] = useState("");
  const [isOAuthButtonClicked, setIsOAuthButtonClicked] = useState(false);

  const [tracks, setTracks] = useState();
  const [error, setError] = useState();

  const [oauthFormSubmit, setOauthFormSubmit] = useState(false);

  const [authUrl, setAuthUrl] = useState("");
  const [clientID, setClientID] = useState("");
  const authRef = useRef();
  const clientIDRef = useRef();

  const [token, getToken] = useOAuth2Token({
    authorizeUrl: authUrl,
    scopes: ["user-library-read"],
    clientID: clientID,
    redirectUri: document.location.href + "callback",
  });

  // const [token, getToken] = useOAuth2Token({
  //   authorizeUrl: "https://accounts.spotify.com/authorize",
  //   scopes: ["user-library-read"],
  //   clientID: "488bcc1986a74e0da81477fbc429ed10",
  //   redirectUri: document.location.href + "callback",
  // });

  // useEffect(() => {
  //   fetch("https://api.spotify.com/v1/me/tracks?limit=50", {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => setTracks(data))
  //     .catch((error) => setError(error));
  // }, [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setSwaggerStore(swaggerData.data.data);
        setMainPath(swaggerData.data.data);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const handleSecurityDefinition = (value) => {
    console.log("value", value);
    if (
      value.toLowerCase().includes("api") ||
      value.toLowerCase().includes("key")
    ) {
      setSecurityDefinition("apikey");
      setSecurityDefinitionPath(value);
      // show api key input
    }

    if (
      value.toLowerCase().includes("basic") ||
      value.toLowerCase().includes("jwt")
    ) {
      findLogin();
      setSecurityDefinition("basic");
    }

    if (
      value.toLowerCase().includes("oauth2") ||
      value.toLowerCase().includes("auth")
    ) {
      setSecurityDefinition("oauth");
    }
  };

  useEffect(() => {
    const handleLocationChange = () => {
      console.log("Current URL:", window.location.href);
    };

    handleLocationChange(); // Initial check

    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  });

  useEffect(() => {
    if (authUrl.length > 0 && clientID.length > 0) {
      console.log("authURl", authUrl);
      console.log("clientid", clientID);
      getToken();
    }
  }, [clientID]);

  const showApiKeyInputForm = () => {
    return (
      <div style={{ marginTop: 10 }}>
        <div>
          <Input
            placeholder="Enter API Key"
            onChange={(e) => {
              setApiKey(e.target.value);
              setAuthHeader(`apiKey:${e.target.value}`);
            }}
            value={apiKey}
          />
          <Button type="primary" style={{ marginTop: 10 }}>
            Set API Key
          </Button>
        </div>
      </div>
    );
  };

  const onFinish = (values) => {
    setAuthUrl(values.authUrl);
    setClientID(values.clientId);
  };

  const showOAuthForm = () => {
    return (
      <div style={{ marginTop: 10 }}>
        <Form onFinish={onFinish}>
          <Form.Item name="authUrl" label="Authorization URL">
            <Input />
          </Form.Item>

          <Form.Item name="clientId" label="Client ID">
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Authenticate with OAuth2
            </Button>
          </Form.Item>
        </Form>
        {/* <div>
          <Input
            placeholder="Your Authorization URL"
            style={{ marginTop: 10 }}
            ref={authRef}
          />
          <Input
            placeholder="Your Client ID"
            style={{ marginTop: 10 }}
            ref={clientIDRef}
          />
          <Input
            placeholder="Your Redirect URI"
            style={{ marginTop: 10 }}
            // onChange={setRedirectUrl}
          />
          <Input
            placeholder="Your Token URL"
            style={{ marginTop: 10 }}
            // onChange={setTokenUrl}
          />

          <Button
            type="primary"
            style={{ marginTop: 10 }}
            onClick={(e) => {
              e.preventDefault();
              setAuthUrl(authRef.current.value);
              setClientID(clientIDRef.current.value);
              // setIsOAuthButtonClicked(true);
              getToken();
            }}
          >
            Authenticate with OAuth2
          </Button>
        </div> */}
      </div>
    );
  };

  const findLogin = async () => {
    try {
      setAuthPath(swaggerLink);
    } catch (e) {
      console.log("ERROR", e);
    }
  };

  const handleSelectChange = (value) => {
    setSelectedPaths(value);
  };

  const baseUrlQuery = useQuery("baseUrl", () =>
    axios
      .post("http://127.0.0.1:5000/get-base-url", {
        swaggerJson: "https://petstore.swagger.io/v2/swagger.json",
      })
      .then((res) => {
        return res;
      })
      .catch((error) => console.log("error", error))
  );

  const getSecurityDefinitionForPath = (selectedPath) => {
    const path = paths.find((obj) => obj.path === selectedPath);
    let securityTypes = [];
    if (path?.object?.security) {
      path?.object?.security?.map((security) => {
        Object.keys(security).forEach((key) => {
          const obj = {
            type: key,
          };
          if (Array.isArray(security[key])) {
            obj.values = [...security[key]];
          } else {
            obj.values = [];
          }
          securityTypes.push(obj);
        });
      });
    }
    return securityTypes;
  };

  if (baseUrlQuery.isLoading) {
    return <Spin size="large" />;
  }

  if (baseUrlQuery.error) {
    return <div>Unable to get base URL</div>;
  }
  console.log("window.location.href", window.location.href);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "start",
      }}
    >
      {swagger && (
        <>
          <div
            style={{
              margin: 7,
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
            }}
          >
            <SecurityDefinitions
              swaggerJson={swagger}
              handleSecurityDefinition={handleSecurityDefinition}
            />
            {/* {showSecurityDefinitionInput()} */}
            {securityDefinition === "oauth" && showOAuthForm()}
            {securityDefinition === "apikey" && showApiKeyInputForm()}
          </div>
          <Collapse style={{ margin: 7 }}>
            <Panel header="API Endpoints Table" key="1">
              <Table
                dataSource={dataSource}
                columns={columns}
                borderedscroll={{ x: "max-content" }}
              />
            </Panel>
          </Collapse>
          <Divider plain></Divider>

          <div
            style={{
              margin: 7,
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
            }}
          >
            <PathsDropdown
              swaggerJson={swagger}
              handleSelectChange={handleSelectChange}
              paths={paths}
            />
          </div>
          <div
            style={{
              margin: 7,
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
            }}
          ></div>
          <div
            style={{
              margin: 7,
              display: "flex",
              flexDirection: "column",
              justifyContent: "start",
            }}
          >
            <SwaggerRequestForms
              selectedPaths={selectedPaths}
              paths={paths}
              schemas={swagger["definitions"]}
              baseUrl={findUrl(baseUrlQuery.data.data.baseUrl)}
              authHeader={authHeader}
              getSecurityDefinitionForPath={getSecurityDefinitionForPath}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default SwaggerTab;
