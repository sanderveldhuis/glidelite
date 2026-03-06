"use strict";
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
/* eslint-disable */
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.ApiImpl = exports.ApiError = void 0;
/**
 * An error as result from a failed HTTP request towards the API.
 */
class ApiError extends Error {
    /**
     * Constructs an API error.
     * @param status the HTTP status code
     */
    constructor(status) {
        super('xhr_error');
        this.status = status;
    }
}
exports.ApiError = ApiError;
/**
 * Executes HTTP requests towards the API.
 */
class ApiImpl {
    /**
     * @see Api.get for details
     */
    get(options) {
        return this.request('get', options);
    }
    /**
     * @see Api.post for details
     */
    post(options) {
        return this.request('post', options);
    }
    /**
     * @see Api.put for details
     */
    put(options) {
        return this.request('put', options);
    }
    /**
     * @see Api.delete for details
     */
    delete(options) {
        return this.request('delete', options);
    }
    /**
     * @see Api.patch for details
     */
    patch(options) {
        return this.request('patch', options);
    }
    /**
     * @see Api.options for details
     */
    options(options) {
        return this.request('options', options);
    }
    /**
     * @see Api.head for details
     */
    head(options) {
        return this.request('head', options);
    }
    /**
     * @see Api.request for details
     */
    request(method, options) {
        // In case of GET, OPTIONS, and HEAD methods the parameters are added to the URL instead of body
        let path = options.path;
        if ((method === 'get' || method === 'options' || method === 'head') && options.params && Object.keys(options.params).length > 0) {
            path += `?${Object.entries(options.params).map(([key, value]) => {
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            }).join('&')}`;
        }
        const promise = new Promise((resolve, reject) => {
            // @ts-ignore
            const xhr = new window.XMLHttpRequest();
            xhr.open(method, `/api${path}`);
            xhr.responseType = options.responseType;
            xhr.timeout = options.timeout ?? 0;
            xhr.addEventListener('load', () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    // Assume if the response URL is not the same as the request it is a redirect
                    if (xhr.responseURL.endsWith(path)) {
                        resolve(xhr.response);
                    }
                    else {
                        // @ts-ignore
                        window.location.href = xhr.responseURL;
                    }
                }
                else {
                    reject(new ApiError(xhr.status));
                }
            });
            xhr.addEventListener('error', () => {
                reject(new ApiError(0));
            });
            xhr.addEventListener('abort', () => {
                reject(new ApiError(0));
            });
            if (options.headers) {
                for (const [key, value] of Object.entries(options.headers)) {
                    xhr.setRequestHeader(key, value);
                }
            }
            if (!options.headers || !Object.keys(options.headers).includes('Content-Type')) {
                xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
            }
            // All methods except GET, OPTIONS, and HEAD will have the parameters in the body
            xhr.send(method !== 'get' && method !== 'options' && method !== 'head' && options.params &&
                Object.keys(options.params).length > 0 ? JSON.stringify(options.params) : null);
        });
        return promise;
    }
}
exports.ApiImpl = ApiImpl;
/**
 * Executes HTTP requests towards the API.
 */
exports.api = new ApiImpl();
