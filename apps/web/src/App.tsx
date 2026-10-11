import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./lib/api/client";

interface ApiResponse {
  success: boolean;
  data: {
    name: string;
    version: string;
  };
}

function App() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["api-status"],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse>("/");
      return response.data;
    },
    retry: 1,
  });

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "80px auto",
        padding: 24,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1>MERN Starter</h1>
      <p>React + TypeScript + Express + MongoDB</p>

      {isLoading && <p>Connecting to the API...</p>}

      {isError && (
        <section>
          <p>Could not connect to the API. Check that the backend is running.</p>
          <button onClick={() => void refetch()}>Retry</button>
        </section>
      )}

      {data && (
        <section>
          <h2>{data.data.name}</h2>
          <p>API version: {data.data.version}</p>
          <p>Connection successful.</p>
        </section>
      )}
    </main>
  );
}

export default App;
