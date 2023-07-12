import React, { useEffect, useState } from "react";
import { Spin, Divider } from "antd";
import { useMutation } from "react-query";

import SwaggerDocInput from "./SwaggerDocInput";
import SwaggerTab from "./SwaggerTab";
import { getSwaggerJsonFile } from "../services/api";
import { useSwaggerStore } from "../store/swaggerStore";
import { shallow } from "zustand/shallow";

const SwaggerDoc = () => {
  const { swaggerUrl, setSwaggerDocUrl } = useSwaggerStore((state) => {
    return { ...state };
  }, shallow);

  const handleSwaggerDocUrlChange = (event) => {
    const value = event.target.value;
    setSwaggerDocUrl(value);
  };

  const { mutate, data, isLoading, isError } = useMutation(getSwaggerJsonFile);

  useEffect(() => {
    if (swaggerUrl) {
      handleSwaggerDocFormSubmit({ preventDefault: () => {} });
    }
  }, []);

  const handleSwaggerDocFormSubmit = (e) => {
    e.preventDefault();
    const body = {
      swaggerUrl: swaggerUrl,
    };
    mutate(body);
  };

  return (
    <div>
      <SwaggerDocInput
        swaggerUrl={swaggerUrl}
        handleSwaggerDocFormSubmit={handleSwaggerDocFormSubmit}
        handleSwaggerDocUrlChange={handleSwaggerDocUrlChange}
      />
      <Divider plain></Divider>
      {isLoading ? (
        <Spin size="large" />
      ) : isError ? (
        <p>Error occurred while fetching data</p>
      ) : (
        data && <SwaggerTab swaggerData={data} />
      )}
    </div>
  );
};

export default SwaggerDoc;
