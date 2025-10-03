// Mock API responses for testing
export const mockRephraseResponse = {
  ok: true,
  body: {
    getReader: () => ({
      read: () => Promise.resolve({
        done: false,
        value: new TextEncoder().encode(
          'data: {"type":"content","style":"professional","content":"This is a professional rephrasing. "}\n\n' +
          'data: {"type":"content","style":"casual","content":"This is a casual rephrasing. "}\n\n' +
          'data: {"type":"content","style":"polite","content":"This is a polite rephrasing. "}\n\n' +
          'data: {"type":"content","style":"social-media","content":"This is a social media rephrasing. "}\n\n' +
          'data: {}\n\n'
        )
      })
    })
  }
};

export const mockErrorResponse = {
  ok: false,
  json: () => Promise.resolve({
    detail: 'API Error: Something went wrong'
  })
};

export const mockEmptyResponse = {
  ok: true,
  body: null
};

// Mock fetch implementation for testing
export const setupMockFetch = (response = mockRephraseResponse) => {
  global.fetch = jest.fn().mockResolvedValue(response);
};

export const setupMockFetchError = () => {
  global.fetch = jest.fn().mockResolvedValue(mockErrorResponse);
};

export const setupMockFetchEmpty = () => {
  global.fetch = jest.fn().mockResolvedValue(mockEmptyResponse);
};