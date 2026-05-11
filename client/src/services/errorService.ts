import axios, { type AxiosError } from 'axios';
import toast from 'react-hot-toast';

type ApiErrorResponse = {
  error?: string
  message?: string
  code?: string
};

type ApiActionError = {
  message: string
  statusCode?: number
  code?: string
};

type ApiActionSuccess<T> = {
  ok: true
  data: T
};

type ApiActionFailure = {
  ok: false
  error: ApiActionError
};

type ApiActionResult<T> = ApiActionSuccess<T> | ApiActionFailure;

type HandleApiActionOptions = {
  successMessage?: string
  errorMessage: string
  logLabel?: string
};

export function extractErrorMessage(error: unknown, errorMessage: string): string {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      errorMessage
    );
  }

  if (error instanceof Error) {
    return error.message || errorMessage;
  }

  return errorMessage;
}

export function extractApiActionError(error: unknown, errorMessage: string): ApiActionError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      message: extractErrorMessage(error, errorMessage),
      statusCode: error.response?.status,
      code: error.response?.data?.code,
    };
  }

  return {
    message: extractErrorMessage(error, errorMessage),
  };
}

export function showSuccessToast(message: string): void {
  toast.success(message);
}

export function showErrorToast(message: string): void {
  toast.error(message);
}

function isCancelledRequest(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === 'ERR_CANCELED';
}

export async function handleApiAction<T>(
  action: () => Promise<T>, 
  options: HandleApiActionOptions
): Promise<ApiActionResult<T>> {
  const { successMessage, errorMessage, logLabel } = options;

  try {
    const data = await action();

    if (successMessage) {
      showSuccessToast(successMessage);
    }
    
    return { ok: true, data };
  } catch (error) {
    if (isCancelledRequest(error)) {
      return {
        ok: false,
        error: {
          message: 'Request cancelled',
          code: 'REQUEST_CANCELLED',
        },
      };
    }

    const apiError = extractApiActionError(error, errorMessage);

    showErrorToast(apiError.message);

    return { ok: false, error: apiError };
  }
}