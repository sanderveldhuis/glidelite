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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExitStatus = void 0;
var ExitStatus;
(function (ExitStatus) {
    ExitStatus[ExitStatus["Success"] = 0] = "Success";
    ExitStatus[ExitStatus["CommandLineOptionUnknown"] = 1001] = "CommandLineOptionUnknown";
    ExitStatus[ExitStatus["CommandLineArgumentMissing"] = 1002] = "CommandLineArgumentMissing";
    ExitStatus[ExitStatus["CommandLineArgumentInvalid"] = 1003] = "CommandLineArgumentInvalid";
    ExitStatus[ExitStatus["DirectoryCreationFailed"] = 2001] = "DirectoryCreationFailed";
    ExitStatus[ExitStatus["DirectoryReadFailed"] = 2002] = "DirectoryReadFailed";
    ExitStatus[ExitStatus["FileAlreadyExists"] = 2010] = "FileAlreadyExists";
    ExitStatus[ExitStatus["FileCreationFailed"] = 2011] = "FileCreationFailed";
    ExitStatus[ExitStatus["FileReadFailed"] = 2012] = "FileReadFailed";
    ExitStatus[ExitStatus["ProjectInvalid"] = 3001] = "ProjectInvalid";
    ExitStatus[ExitStatus["ProjectCompileFailed"] = 3002] = "ProjectCompileFailed";
})(ExitStatus || (exports.ExitStatus = ExitStatus = {}));
