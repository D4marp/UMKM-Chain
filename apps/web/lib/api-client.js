const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const getAuthToken = () => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    const raw = window.localStorage.getItem("umkmchain.session");
    if (!raw) {
      return "";
    }

    const parsed = JSON.parse(raw);
    return parsed.token || "";
  } catch (_error) {
    return "";
  }
};

const getHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleJson = async (response) => {
  const body = await response.json();
  if (!response.ok) {
    const message = body.error || "Request failed";
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }
  return body;
};

export const apiClient = {
  async registerUser(payload) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return handleJson(response);
  },

  async loginUser(payload) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    return handleJson(response);
  },

  async getDemoSession(role) {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/demo?role=${encodeURIComponent(role)}`,
      { cache: "no-store" }
    );
    return handleJson(response);
  },

  async getFundingRequests() {
    const response = await fetch(`${API_BASE_URL}/api/funding/requests`, {
      cache: "no-store",
      headers: getHeaders()
    });
    return handleJson(response);
  },

  async getFundingEvents() {
    const response = await fetch(`${API_BASE_URL}/api/funding/events`, {
      cache: "no-store",
      headers: getHeaders()
    });
    return handleJson(response);
  },

  async getDocuments(msmeId) {
    const query = msmeId ? `?msmeId=${encodeURIComponent(msmeId)}` : "";
    const response = await fetch(`${API_BASE_URL}/api/funding/documents${query}`, {
      cache: "no-store",
      headers: getHeaders()
    });
    return handleJson(response);
  },

  async getNonce(address, role) {
    const response = await fetch(
      `${API_BASE_URL}/api/auth/nonce?address=${encodeURIComponent(address)}&role=${encodeURIComponent(role)}`,
      { cache: "no-store" }
    );
    return handleJson(response);
  },

  async verifySiwe(message, signature) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message, signature })
    });
    return handleJson(response);
  },

  async getSession() {
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      cache: "no-store",
      headers: getHeaders()
    });
    return handleJson(response);
  },

  async getRegulatorSummary() {
    const response = await fetch(`${API_BASE_URL}/api/dashboard/regulator`, {
      cache: "no-store",
      headers: getHeaders()
    });
    return handleJson(response);
  },

  async uploadInvoice(payload) {
    const response = await fetch(`${API_BASE_URL}/api/funding/document/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders()
      },
      body: JSON.stringify(payload)
    });

    return handleJson(response);
  },

  async confirmBrowserSubmit(documentId, payload) {
    const response = await fetch(
      `${API_BASE_URL}/api/funding/documents/${documentId}/confirm-browser-submit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getHeaders()
        },
        body: JSON.stringify(payload)
      }
    );

    return handleJson(response);
  },

  async registerMsme(payload) {
    const response = await fetch(`${API_BASE_URL}/api/funding/msme/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders()
      },
      body: JSON.stringify(payload)
    });

    return handleJson(response);
  },

  async confirmFundingRequest(payload) {
    const response = await fetch(`${API_BASE_URL}/api/funding/request/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getHeaders()
      },
      body: JSON.stringify(payload)
    });

    return handleJson(response);
  },

  getSocketUrl() {
    return API_BASE_URL;
  }
};
