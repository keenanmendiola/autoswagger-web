import create from "zustand";
import axios from "axios";
import { extractPathsFromSwagger } from "../utils/swagger";
import { persist, createJSONStorage } from "zustand/middleware";

export const useSwaggerStore = create(
  persist(
    (set, get) => ({
      swagger: {},
      selectedPaths: [],
      paths: {},
      dataSource: {},
      mainPath: "",
      swaggerLink: "",
      authPath: "",
      apiKey: "",
      authHeader: "",
      swaggerUrl: "",
      setSwaggerDocUrl: (swaggerUrl) => {
        set({ swaggerUrl });
      },
      setSwagger: (swagger) => {
        set({ swagger });
      },
      setSelectedPaths: (selectedPaths) => {
        set({ selectedPaths });
      },
      setPaths: (paths) => {
        set({ paths });
      },
      setDataSource: (dataSource) => {
        set({ dataSource });
      },
      setMainPath: async (swaggerLink) => {
        const mainPathResponse = await axios.post(
          "http://127.0.0.1:5000/main-endpoint",
          { swaggerLink }
        );
        const { paths } = useSwaggerStore.getState();
        set({ mainPath: paths[mainPathResponse.data.path] });
      },
      setSwaggerLink: (swaggerLink) => {
        set({ swaggerLink });
      },
      setAuthPath: async (swaggerLink) => {
        const response = await axios.post(
          "http://127.0.0.1:5000/find-basic-auth-path",
          { swaggerLink }
        );
        set({ authPath: response.data["basic-auth-path"] });
      },
      setApiKey: (apiKey) => {
        set({ apiKey });
      },
      setAuthHeader: (authHeader) => {
        set({ authHeader });
      },
      setSwaggerStore: async (swaggerLink) => {
        const response = await axios.get(swaggerLink);
        const swaggerObj = {
          swagger: response.data,
          paths: extractPathsFromSwagger(response.data),
          dataSource: Object.entries(response.data.paths).map(
            ([path, pathDetails]) => ({
              path,
              verb: Object.keys(pathDetails)[0],
              ...pathDetails[Object.keys(pathDetails)[0]],
            })
          ),
          swaggerLink: swaggerLink,
        };
        set(swaggerObj);
      },
    }),
    { name: "swaggerStore", storage: createJSONStorage(() => localStorage) }
  )
);
