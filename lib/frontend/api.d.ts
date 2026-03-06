/**
 * MIT License
 *
 * Copyright (c) 2025 Sander Veldhuis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
/**
 * Available HTTP methods
 */
type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'options' | 'head';
/**
 * The response type.
 */
type ResponseType = 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
/**
 * The return type based on the response type.
 */
type ReturnType<T> = T extends 'arraybuffer' ? Promise<ArrayBuffer | null> : T extends 'blob' ? Promise<Blob | null> : T extends 'document' ? Promise<Document | null> : T extends 'json' ? Promise<object | null> : T extends 'text' ? Promise<string> : never;
/**
 * Options for HTTP requests towards the API.
 */
interface ApiRequestOptions<T> {
    /** The request URL path */
    path: string;
    /** The request params (optional) */
    params?: Record<string, string | number | boolean>;
    /** The request headers (optional) */
    headers?: Record<string, string>;
    /** The request timeout in milliseconds (optional) */
    timeout?: number;
    /** The response type */
    responseType: T;
}
/**
 * An error as result from a failed HTTP request towards the API.
 */
export declare class ApiError extends Error {
    /** The HTTP status code, or zero on client-side error */
    status: number;
    /**
     * Constructs an API error.
     * @param status the HTTP status code
     */
    constructor(status: number);
}
/**
 * Executes HTTP requests towards the API.
 */
export interface Api {
    /**
     * Executes an HTTP GET request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.get({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    get: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP POST request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.post({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    post: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP PUT request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.put({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    put: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP DELETE request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.delete({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    delete: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP PATCH request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.patch({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    patch: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP OPTIONS request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.options({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    options: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP HEAD request towards the API.
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.head({ path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    head: <T extends ResponseType>(options: ApiRequestOptions<T>) => ReturnType<T>;
    /**
     * Executes an HTTP request towards the API.
     * @param method the HTTP method
     * @param options the request options
     * @returns a `Promise` which will resolve on 2xx HTTP status codes, otherwise it will reject with an `ApiError` object
     * @details
     * ```js
     * // Execute a request and parse the response as JSON
     * Api.request('get', { path: '/hello', responseType: 'json', params: { name: 'John Doe' } }).then(result => {
     *   ...
     * }).catch((error: unknown) => {
     *   if (error instanceof ApiError) {
     *     ...
     *   }
     * });
     * ```
     */
    request: <T extends ResponseType>(method: HttpMethod, options: ApiRequestOptions<T>) => ReturnType<T>;
}
/**
 * Executes HTTP requests towards the API.
 */
export declare class ApiImpl {
    /**
     * @see Api.get for details
     */
    get<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.post for details
     */
    post<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.put for details
     */
    put<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.delete for details
     */
    delete<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.patch for details
     */
    patch<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.options for details
     */
    options<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.head for details
     */
    head<T extends ResponseType>(options: ApiRequestOptions<T>): ReturnType<T>;
    /**
     * @see Api.request for details
     */
    request<T extends ResponseType>(method: HttpMethod, options: ApiRequestOptions<T>): ReturnType<T>;
}
/**
 * Executes HTTP requests towards the API.
 */
export declare const api: Api;
export {};
