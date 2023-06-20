export const HttpRequestHeader = {
  AIM: 'A-IM',
  Accept: 'Accept',
  AcceptCharset: 'Accept-Charset',
  AcceptDatetime: 'Accept-Datetime',
  AcceptEncoding: 'Accept-Encoding',
  AcceptLanguage: 'Accept-Language',
  AccessControlRequestHeaders: 'Access-Control-Request-Headers',
  AccessControlRequestMethod: 'Access-Control-Request-Method',
  Authorization: 'Authorization',
  CacheControl: 'Cache-Control',
  Connection: 'Connection',
  ContentEncoding: 'Content-Encoding',
  ContentLength: 'Content-Length',
  ContentMD5: 'Content-MD5',
  ContentType: 'Content-Type',
  Cookie: 'Cookie',
  Date: 'Date',
  Expect: 'Expect',
  Forwarded: 'Forwarded',
  From: 'From',
  Host: 'Host',
  IfMatch: 'If-Match',
  IfModifiedSince: 'If-Modified-Since',
  IfNoneMatch: 'If-None-Match',
  IfRange: 'If-Range',
  IfUnmodifiedSince: 'If-Unmodified-Since',
  MaxForwards: 'Max-Forwards',
  Origin: 'Origin',
  Pragma: 'Pragma',
  Prefer: 'Prefer',
  ProxyAuthorization: 'Proxy-Authorization',
  Range: 'Range',
  Referer: 'Referer',
  TE: 'TE',
  Trailer: 'Trailer',
  TransferEncoding: 'Transfer-Encoding',
  UserAgent: 'User-Agent',
  Upgrade: 'Upgrade',
  Via: 'Via',
  Warning: 'Warning',
  // Non-standard
  UpgradeInsecureRequests: 'Upgrade-Insecure-Requests',
  XRequestedWith: 'X-Requested-With',
  DNT: 'DNT',
  XForwardedFor: 'X-Forwarded-For',
  XForwardedHost: 'X-Forwarded-Host',
  XForwardedProto: 'X-Forwarded-Proto',
  FrontEndHttps: 'Front-End-Https',
  XHttpMethodOverride: 'X-Http-Method-Override',
  XATTDeviceId: 'X-ATT-DeviceId',
  XWapProfile: 'X-Wap-Profile',
  ProxyConnection: 'Proxy-Connection',
  XUIDH: 'X-UIDH',
  XCsrfToken: 'X-Csrf-Token',
  XRequestID: 'X-Request-ID',
  XCorrelationID: 'X-Correlation-ID',
  SaveData: 'Save-Data',
} as const;

export const HttpResponseHeader = {
  AcceptCH: 'Accept-CH',
  AccessControlAllowOrigin: 'Access-Control-Allow-Origin',
  AccessControlAllowCredentials: 'Access-Control-Allow-Credentials',
  AccessControlAllowMethods: 'Access-Control-Allow-Methods',
  AccessControlAllowHeaders: 'Access-Control-Allow-Headers',
  AccessControlExposeHeaders: 'Access-Control-Expose-Headers',
  AccessControlMaxAge: 'Access-Control-Max-Age',
  AcceptPatch: 'Accept-Patch',
  AcceptRanges: 'Accept-Ranges',
  Age: 'Age',
  Allow: 'Allow',
  AltSvc: 'Alt-Svc',
  CacheControl: 'Cache-Control',
  Connection: 'Connection',
  ContentDisposition: 'Content-Disposition',
  ContentEncoding: 'Content-Encoding',
  ContentLanguage: 'Content-Language',
  ContentLength: 'Content-Length',
  ContentLocation: 'Content-Location',
  ContentMD5: 'Content-MD5',
  ContentRange: 'Content-Range',
  ContentType: 'Content-Type',
  Date: 'Date',
  DeltaBase: 'Delta-Base',
  ETag: 'ETag',
  Expires: 'Expires',
  IM: 'IM',
  LastModified: 'Last-Modified',
  Link: 'Link',
  Location: 'Location',
  P3P: 'P3P',
  Pragma: 'Pragma',
  PreferenceApplied: 'Preference-Applied',
  ProxyAuthenticate: 'Proxy-Authenticate',
  PublicKeyPins: 'Public-Key-Pins',
  RetryAfter: 'Retry-After',
  Server: 'Server',
  SetCookie: 'Set-Cookie',
  StrictTransportSecurity: 'Strict-Transport-Security',
  Trailer: 'Trailer',
  TransferEncoding: 'Transfer-Encoding',
  Tk: 'Tk',
  Upgrade: 'Upgrade',
  Vary: 'Vary',
  Via: 'Via',
  Warning: 'Warning',
  WWWAuthenticate: 'WWW-Authenticate',
  XFrameOptions: 'X-Frame-Options',
  // Non-standard
  ContentSecurityPolicy: 'Content-Security-Policy',
  XContentSecurityPolicy: 'X-Content-Security-Policy',
  XWebKitCSP: 'X-WebKit-CSP',
  ExpectCT: 'Expect-CT',
  NEL: 'NEL',
  PermissionsPolicy: 'Permissions-Policy',
  Refresh: 'Refresh',
  ReportTo: 'Report-To',
  Status: 'Status',
  TimingAllowOrigin: 'Timing-Allow-Origin',
  XContentDuration: 'X-Content-Duration',
  XContentTypeOptions: 'X-Content-Type-Options',
  XPoweredBy: 'X-Powered-By',
  XRedirectBy: 'X-Redirect-By',
  XRequestID: 'X-Request-ID',
  XCorrelationID: 'X-Correlation-ID',
  XUACompatible: 'X-UA-Compatible',
  XXSSProtection: 'X-XSS-Protection',
} as const;

export const HttpHeader = {
  ...HttpRequestHeader,
  ...HttpResponseHeader,
} as const;

export type HttpRequestHeadersName = (typeof HttpRequestHeader)[keyof typeof HttpRequestHeader];
export type HttpResponseHeadersName = (typeof HttpResponseHeader)[keyof typeof HttpResponseHeader];
export type HttpHeadersName = (typeof HttpHeader)[keyof typeof HttpHeader];

export type HttpRequestHeaders = Array<[key: HttpRequestHeadersName | string, value: string | number]>;
export type HttpResponseHeaders = Array<[key: HttpResponseHeadersName | string, value: string | number]>;
export type HttpHeaders = Array<[key: HttpHeadersName | string, value: string | number]>;