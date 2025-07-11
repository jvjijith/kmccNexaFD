// api.js

import axios from 'axios';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { jwtDecode } from "jwt-decode";

const baseURL = import.meta.env.VITE_BASE_URL;

// Configure Axios instance with base URL
const api = axios.create({
  baseURL,
});

// Create a single query client instance
const queryClient = new QueryClient();

api.interceptors.request.use(
  async (config) => {
    try {
      let tokenData = JSON.parse(localStorage.getItem("user"));

      if (tokenData?.accessToken) {
        // Decode the access token to check its expiration
        const decodedAccessToken = jwtDecode(tokenData.accessToken);
        const isAccessTokenExpired = decodedAccessToken.exp * 1000 < Date.now();

        if (!isAccessTokenExpired) {
          config.headers["Authorization"] = `Bearer ${tokenData.accessToken}`;
          return config; // Access token is valid, proceed with the request
        }
      }

      if (tokenData?.refreshToken) {
        // If the newAccessToken is expired or missing, attempt to refresh it
        const decodedRefreshToken = jwtDecode(tokenData.refreshToken);
        const isRefreshTokenExpired = decodedRefreshToken.exp * 1000 < Date.now();

        if (isRefreshTokenExpired) {
          console.error("Refresh token has expired");
          // Clear localStorage and redirect to login
          localStorage.removeItem("user");
          window.location.href = "/login"; // Replace with your login route
          throw new Error("Refresh token expired");
        }

        // If the refresh token is valid, request a new access token
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh-token`, {
          refreshToken: tokenData.refreshToken,
        });

        const newTokenData = {
          ...tokenData,
          accessToken: refreshResponse.data.accessToken,
        };
        localStorage.setItem("user", JSON.stringify(newTokenData));

        config.headers["Authorization"] = `Bearer ${refreshResponse.data.accessToken}`;
      } else {
        console.log("No authorization token found in localStorage");
      }
    } catch (error) {
      console.error("Error refreshing token:", error.response?.data || error.message);

      // Clear localStorage and redirect if token refresh fails
      localStorage.removeItem("user");
      window.location.href = "/login"; // Replace with your login route
      throw new Error("Token refresh failed");
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);




// Define a function to handle invalidating and refetching queries after a mutation
const useInvalidateQueries = () => {
  const queryClient = useQueryClient();

  return async (key) => {
    await queryClient.invalidateQueries(key);
    //await queryClient.refetchQueries(key);
  };
};

// Define a generic hook for fetching data
const useApiQuery = (key, url, options = {}) => {
  console.log(options);
 return useQuery({
    queryKey: [key, url], // Include URL in query key to refetch when URL changes
    queryFn: async () => {
      try {
      const { data } = await api.get(url, options);
      // console.log(data);
      return data;
      }catch (error) {
        console.error('Error in API Call:', error);
        throw error;
      }

    },
  });
  // return useQuery({key, async ()  {
  //   const { data } = await api.get(url, options);
  //   console.log(data);
  //   return data;
  // }});
};

// Define a generic hook for posting, updating, or deleting data
const useApiMutation = (key, url, method) => {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: async (payload) => {
      try {
        // Support both simple data and { url, data } structure
        let actualUrl = url;
        let postData = payload;

        if (payload && typeof payload === 'object' && payload.url && payload.data) {
          actualUrl = payload.url;
          postData = payload.data;
        }

        const response = await api[method](actualUrl, postData);
        console.log('API Response:', response);  // Log the full response
        const { data } = response;
        if (!data) {
          throw new Error('No data returned from API');
        }
        return data;
      } catch (error) {
        console.error('Error in API Call:', error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      toast.success(data.message || 'Operation successful');
      await invalidateQueries(key);
    },
    onError: (error) => {
      console.error('Mutation Error:', error);
      toast.error('Operation failed. Please try again later.');
      throw error; // Rethrow the error to be caught by the component
    }
  });
};



// Define your generic hooks using the configured axios instance
const useGetData = (key, url, options = {}) => {
  console.log(options);
  return useApiQuery(key, url, options);
};

const usePostData = (key, url) => {
  return useApiMutation(key, url, 'post');
};

const usePutData = (key, url) => {
  return useApiMutation(key, url, 'put');
};

const useDeleteData = (key, url) => {
  return useApiMutation(key, url, 'delete');
};

// Export the QueryClientProvider with your custom queries and mutations
export const ApiProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastContainer></ToastContainer>
      {children}
    </QueryClientProvider>
  );
};

export { useGetData, usePostData, usePutData, useDeleteData };
