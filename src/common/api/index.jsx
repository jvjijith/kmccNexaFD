// api.js

import axios from 'axios';
import { useQuery, useMutation, useQueryClient, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { B2 } from 'backblaze-b2';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const baseURL = 'https://dev.nexalogics.com.au/api';

// Configure Axios instance with base URL
const api = axios.create({
  baseURL,
});

// Create a single query client instance
const queryClient = new QueryClient();

// Add an interceptor to include the authorization token in the request headers
api.interceptors.request.use(
  (config) => {
    const token = JSON.parse(localStorage.getItem('user'));

    if (token.accessToken) {
      config.headers['Authorization'] = `Bearer ${token.accessToken}`;
      console.log('Authorization token included in request:', token.accessToken);
    }
    else
    {
      console.log('No authorization token found in localStorage');
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
    queryKey: [key],
    queryFn: async () => {
      const { data } = await api.get(url, options);
      console.log(data);
      return data;
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
    mutationFn: async (postData) => {
      const { data } = await api[method](url, postData);
      return data;
    },
      onSuccess: async (data) => {
        toast.success(data.message);
        await invalidateQueries(key);
      },
      onError: (error) => {
        console.error('Mutation Error:', error);
        toast.error('Failed to add category. Please try again later.');
        throw error; // Rethrow the error to be caught by the component
      }
  });
};

const generatePreSignedUrl = async (bucketId="ace08604054d19a29613061f", fileName="2019-03-08.png") => {
  // Initialize B2 with restricted key
  const b2 = new B2({
    applicationKeyId: 'c0645d92636f', // Replace with your restricted key ID
    applicationKey: '0055b8264f72e8cbc18f4d25b66b9475892416b1e0', // Replace with your restricted key
  });

  try {
    // Authorize B2 account
    await b2.authorize();

    // Generate pre-signed URL
    const response = await b2.getDownloadAuthorization({
      bucketId,
      fileNamePrefix: fileName, // Use fileName to determine the file path
      validDurationInSeconds: 3600, // 1 hour
    });

    const preSignedUrl = response.data.authorizationToken;
    console.log('Pre-signed URL:', preSignedUrl); // Log pre-signed URL to console
    toast.success('Pre-signed URL generated successfully');
    return preSignedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    toast.error('Failed to generate pre-signed URL. Please try again later.');
    throw error;
  }
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

export { useGetData, usePostData, usePutData, useDeleteData, generatePreSignedUrl };
