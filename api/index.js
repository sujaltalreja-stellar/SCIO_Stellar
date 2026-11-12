import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);

// node_modules/convex/dist/esm/index.js
var version = "1.45.0";

// node_modules/convex/dist/esm/values/base64.js
var lookup = [];
var revLookup = [];
var Arr = Uint8Array;
var code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
for (i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}
var i;
var len;
revLookup["-".charCodeAt(0)] = 62;
revLookup["_".charCodeAt(0)] = 63;
function getLens(b64) {
  var len = b64.length;
  if (len % 4 > 0) {
    throw new Error("Invalid string. Length must be a multiple of 4");
  }
  var validLen = b64.indexOf("=");
  if (validLen === -1) validLen = len;
  var placeHoldersLen = validLen === len ? 0 : 4 - validLen % 4;
  return [validLen, placeHoldersLen];
}
function _byteLength(_b64, validLen, placeHoldersLen) {
  return (validLen + placeHoldersLen) * 3 / 4 - placeHoldersLen;
}
function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  var arr2 = new Arr(_byteLength(b64, validLen, placeHoldersLen));
  var curByte = 0;
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;
  var i;
  for (i = 0; i < len; i += 4) {
    tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
    arr2[curByte++] = tmp >> 16 & 255;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 2) {
    tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
    arr2[curByte++] = tmp & 255;
  }
  if (placeHoldersLen === 1) {
    tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
    arr2[curByte++] = tmp >> 8 & 255;
    arr2[curByte++] = tmp & 255;
  }
  return arr2;
}
function tripletToBase64(num2) {
  return lookup[num2 >> 18 & 63] + lookup[num2 >> 12 & 63] + lookup[num2 >> 6 & 63] + lookup[num2 & 63];
}
function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp = (uint8[i] << 16 & 16711680) + (uint8[i + 1] << 8 & 65280) + (uint8[i + 2] & 255);
    output.push(tripletToBase64(tmp));
  }
  return output.join("");
}
function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3;
  var parts = [];
  var maxChunkLength = 16383;
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[tmp << 4 & 63] + "==");
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] + lookup[tmp >> 4 & 63] + lookup[tmp << 2 & 63] + "="
    );
  }
  return parts.join("");
}

// node_modules/convex/dist/esm/common/index.js
function parseArgs(args) {
  if (args === void 0) {
    return {};
  }
  if (!isSimpleObject(args)) {
    throw new Error(
      `The arguments to a Convex function must be an object. Received: ${args}`
    );
  }
  return args;
}
function validateDeploymentUrl(deploymentUrl) {
  if (typeof deploymentUrl === "undefined") {
    throw new Error(
      `Client created with undefined deployment address. If you used an environment variable, check that it's set.`
    );
  }
  if (typeof deploymentUrl !== "string") {
    throw new Error(
      `Invalid deployment address: found ${deploymentUrl}".`
    );
  }
  if (!(deploymentUrl.startsWith("http:") || deploymentUrl.startsWith("https:"))) {
    throw new Error(
      `Invalid deployment address: Must start with "https://" or "http://". Found "${deploymentUrl}".`
    );
  }
  try {
    new URL(deploymentUrl);
  } catch {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" is not a valid URL. If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
  if (deploymentUrl.endsWith(".convex.site")) {
    throw new Error(
      `Invalid deployment address: "${deploymentUrl}" ends with .convex.site, which is used for HTTP Actions. Convex deployment URLs typically end with .convex.cloud? If you believe this URL is correct, use the \`skipConvexDeploymentUrlCheck\` option to bypass this.`
    );
  }
}
function isSimpleObject(value) {
  const isObject = typeof value === "object";
  const prototype = Object.getPrototypeOf(value);
  const isSimple = prototype === null || prototype === Object.prototype || // Objects generated from other contexts (e.g. across Node.js `vm` modules) will not satisfy the previous
  // conditions but are still simple objects.
  prototype?.constructor?.name === "Object";
  return isObject && isSimple;
}

// node_modules/convex/dist/esm/values/value.js
var LITTLE_ENDIAN = true;
var MIN_INT64 = BigInt("-9223372036854775808");
var MAX_INT64 = BigInt("9223372036854775807");
var ZERO = BigInt("0");
var EIGHT = BigInt("8");
var TWOFIFTYSIX = BigInt("256");
var COMMIT_TS_UNRESOLVED = "This commit timestamp is unresolved: its value is assigned when the mutation commits. Read the document after the mutation completes to get its value.";
var CommitTsPlaceholder = class {
  [Symbol.toPrimitive](hint) {
    if (hint === "string") {
      return this.toString();
    }
    throw new Error(COMMIT_TS_UNRESOLVED);
  }
  valueOf() {
    throw new Error(COMMIT_TS_UNRESOLVED);
  }
  toJSON() {
    throw new Error(COMMIT_TS_UNRESOLVED);
  }
  toString() {
    return "[unresolved commit timestamp]";
  }
};
var commitTsPlaceholder = new CommitTsPlaceholder();
function isSpecial(n) {
  return Number.isNaN(n) || !Number.isFinite(n) || Object.is(n, -0);
}
function slowBigIntToBase64(value) {
  if (value < ZERO) {
    value -= MIN_INT64 + MIN_INT64;
  }
  let hex = value.toString(16);
  if (hex.length % 2 === 1) hex = "0" + hex;
  const bytes = new Uint8Array(new ArrayBuffer(8));
  let i = 0;
  for (const hexByte of hex.match(/.{2}/g).reverse()) {
    bytes.set([parseInt(hexByte, 16)], i++);
    value >>= EIGHT;
  }
  return fromByteArray(bytes);
}
function slowBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  let value = ZERO;
  let power = ZERO;
  for (const byte of integerBytes) {
    value += BigInt(byte) * TWOFIFTYSIX ** power;
    power++;
  }
  if (value > MAX_INT64) {
    value += MIN_INT64 + MIN_INT64;
  }
  return value;
}
function modernBigIntToBase64(value) {
  if (value < MIN_INT64 || MAX_INT64 < value) {
    throw new Error(
      `BigInt ${value} does not fit into a 64-bit signed integer.`
    );
  }
  const buffer = new ArrayBuffer(8);
  new DataView(buffer).setBigInt64(0, value, true);
  return fromByteArray(new Uint8Array(buffer));
}
function modernBase64ToBigInt(encoded) {
  const integerBytes = toByteArray(encoded);
  if (integerBytes.byteLength !== 8) {
    throw new Error(
      `Received ${integerBytes.byteLength} bytes, expected 8 for $integer`
    );
  }
  const intBytesView = new DataView(integerBytes.buffer);
  return intBytesView.getBigInt64(0, true);
}
var bigIntToBase64 = DataView.prototype.setBigInt64 ? modernBigIntToBase64 : slowBigIntToBase64;
var base64ToBigInt = DataView.prototype.getBigInt64 ? modernBase64ToBigInt : slowBase64ToBigInt;
var MAX_IDENTIFIER_LEN = 1024;
function validateObjectField(k) {
  if (k.length > MAX_IDENTIFIER_LEN) {
    throw new Error(
      `Field name ${k} exceeds maximum field name length ${MAX_IDENTIFIER_LEN}.`
    );
  }
  if (k.startsWith("$")) {
    throw new Error(`Field name ${k} starts with a '$', which is reserved.`);
  }
  for (let i = 0; i < k.length; i += 1) {
    const charCode = k.charCodeAt(i);
    if (charCode < 32 || charCode >= 127) {
      throw new Error(
        `Field name ${k} has invalid character '${k[i]}': Field names can only contain non-control ASCII characters`
      );
    }
  }
}
function jsonToConvex(value) {
  if (value === null) {
    return value;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((value2) => jsonToConvex(value2));
  }
  if (typeof value !== "object") {
    throw new Error(`Unexpected type of ${value}`);
  }
  const entries = Object.entries(value);
  if (entries.length === 1) {
    const key = entries[0][0];
    if (key === "$bytes") {
      if (typeof value.$bytes !== "string") {
        throw new Error(`Malformed $bytes field on ${value}`);
      }
      return toByteArray(value.$bytes).buffer;
    }
    if (key === "$integer") {
      if (typeof value.$integer !== "string") {
        throw new Error(`Malformed $integer field on ${value}`);
      }
      return base64ToBigInt(value.$integer);
    }
    if (key === "$float") {
      if (typeof value.$float !== "string") {
        throw new Error(`Malformed $float field on ${value}`);
      }
      const floatBytes = toByteArray(value.$float);
      if (floatBytes.byteLength !== 8) {
        throw new Error(
          `Received ${floatBytes.byteLength} bytes, expected 8 for $float`
        );
      }
      const floatBytesView = new DataView(floatBytes.buffer);
      const float = floatBytesView.getFloat64(0, LITTLE_ENDIAN);
      if (!isSpecial(float)) {
        throw new Error(`Float ${float} should be encoded as a number`);
      }
      return float;
    }
    if (key === "$commitTs") {
      if (value.$commitTs !== null) {
        throw new Error(`Malformed $commitTs field on ${value}`);
      }
      return commitTsPlaceholder;
    }
    if (key === "$set") {
      throw new Error(
        `Received a Set which is no longer supported as a Convex type.`
      );
    }
    if (key === "$map") {
      throw new Error(
        `Received a Map which is no longer supported as a Convex type.`
      );
    }
  }
  const out = {};
  for (const [k, v2] of Object.entries(value)) {
    validateObjectField(k);
    out[k] = jsonToConvex(v2);
  }
  return out;
}
var MAX_VALUE_FOR_ERROR_LEN = 16384;
function stringifyValueForError(value) {
  const str2 = JSON.stringify(value, (_key, value2) => {
    if (value2 === void 0) {
      return "undefined";
    }
    if (typeof value2 === "bigint") {
      return `${value2.toString()}n`;
    }
    return value2;
  });
  if (str2.length > MAX_VALUE_FOR_ERROR_LEN) {
    const rest = "[...truncated]";
    let truncateAt = MAX_VALUE_FOR_ERROR_LEN - rest.length;
    const codePoint = str2.codePointAt(truncateAt - 1);
    if (codePoint !== void 0 && codePoint > 65535) {
      truncateAt -= 1;
    }
    return str2.substring(0, truncateAt) + rest;
  }
  return str2;
}
function convexToJsonInternal(value, originalValue, context, includeTopLevelUndefined) {
  if (value === void 0) {
    const contextText = context && ` (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )})`;
    throw new Error(
      `undefined is not a valid Convex value${contextText}. To learn about Convex's supported types, see https://docs.convex.dev/using/types.`
    );
  }
  if (value === null) {
    return value;
  }
  if (typeof value === "bigint") {
    if (value < MIN_INT64 || MAX_INT64 < value) {
      throw new Error(
        `BigInt ${value} does not fit into a 64-bit signed integer.`
      );
    }
    return { $integer: bigIntToBase64(value) };
  }
  if (typeof value === "number") {
    if (isSpecial(value)) {
      const buffer = new ArrayBuffer(8);
      new DataView(buffer).setFloat64(0, value, LITTLE_ENDIAN);
      return { $float: fromByteArray(new Uint8Array(buffer)) };
    } else {
      return value;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof ArrayBuffer) {
    return { $bytes: fromByteArray(new Uint8Array(value)) };
  }
  if (value instanceof CommitTsPlaceholder) {
    return { $commitTs: null };
  }
  if (Array.isArray(value)) {
    return value.map(
      (value2, i) => convexToJsonInternal(value2, originalValue, context + `[${i}]`, false)
    );
  }
  if (value instanceof Set) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Set", [...value], originalValue)
    );
  }
  if (value instanceof Map) {
    throw new Error(
      errorMessageForUnsupportedType(context, "Map", [...value], originalValue)
    );
  }
  if (!isSimpleObject(value)) {
    const theType = value?.constructor?.name;
    const typeName = theType ? `${theType} ` : "";
    throw new Error(
      errorMessageForUnsupportedType(context, typeName, value, originalValue)
    );
  }
  const out = {};
  const entries = Object.entries(value);
  entries.sort(([k1, _v1], [k2, _v2]) => k1 === k2 ? 0 : k1 < k2 ? -1 : 1);
  for (const [k, v2] of entries) {
    if (v2 !== void 0) {
      validateObjectField(k);
      out[k] = convexToJsonInternal(v2, originalValue, context + `.${k}`, false);
    } else if (includeTopLevelUndefined) {
      validateObjectField(k);
      out[k] = convexOrUndefinedToJsonInternal(
        v2,
        originalValue,
        context + `.${k}`
      );
    }
  }
  return out;
}
function errorMessageForUnsupportedType(context, typeName, value, originalValue) {
  if (context) {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type (present at path ${context} in original object ${stringifyValueForError(
      originalValue
    )}). To learn about Convex's supported types, see https://docs.convex.dev/using/types.`;
  } else {
    return `${typeName}${stringifyValueForError(
      value
    )} is not a supported Convex type.`;
  }
}
function convexOrUndefinedToJsonInternal(value, originalValue, context) {
  if (value === void 0) {
    return { $undefined: null };
  } else {
    if (originalValue === void 0) {
      throw new Error(
        `Programming error. Current value is ${stringifyValueForError(
          value
        )} but original value is undefined`
      );
    }
    return convexToJsonInternal(value, originalValue, context, false);
  }
}
function convexToJson(value) {
  return convexToJsonInternal(value, value, "", false);
}

// node_modules/convex/dist/esm/values/validators.js
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var UNDEFINED_VALIDATOR_ERROR_URL = "https://docs.convex.dev/error#undefined-validator";
function throwUndefinedValidatorError(context, fieldName) {
  const fieldInfo = fieldName !== void 0 ? ` for field "${fieldName}"` : "";
  throw new Error(
    `A validator is undefined${fieldInfo} in ${context}. This is often caused by circular imports. See ${UNDEFINED_VALIDATOR_ERROR_URL} for details.`
  );
}
var BaseValidator = class {
  constructor({ isOptional }) {
    __publicField(this, "type");
    __publicField(this, "fieldPaths");
    __publicField(this, "isOptional");
    __publicField(this, "isConvexValidator");
    this.isOptional = isOptional;
    this.isConvexValidator = true;
  }
};
var VId = class _VId extends BaseValidator {
  /**
   * Usually you'd use `v.id(tableName)` instead.
   */
  constructor({
    isOptional,
    tableName
  }) {
    super({ isOptional });
    __publicField(this, "tableName");
    __publicField(this, "kind", "id");
    if (typeof tableName !== "string") {
      throw new Error("v.id(tableName) requires a string");
    }
    this.tableName = tableName;
  }
  /** @internal */
  get json() {
    return { type: "id", tableName: this.tableName };
  }
  /** @internal */
  asOptional() {
    return new _VId({
      isOptional: "optional",
      tableName: this.tableName
    });
  }
};
var VFloat64 = class _VFloat64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "float64");
  }
  /** @internal */
  get json() {
    return { type: "number" };
  }
  /** @internal */
  asOptional() {
    return new _VFloat64({
      isOptional: "optional"
    });
  }
};
var VInt64 = class _VInt64 extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "int64");
  }
  /** @internal */
  get json() {
    return { type: "bigint" };
  }
  /** @internal */
  asOptional() {
    return new _VInt64({ isOptional: "optional" });
  }
};
var VCommitTs = class _VCommitTs extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "commitTs");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VCommitTs({
      isOptional: "optional"
    });
  }
};
var VBoolean = class _VBoolean extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "boolean");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBoolean({
      isOptional: "optional"
    });
  }
};
var VBytes = class _VBytes extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "bytes");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VBytes({ isOptional: "optional" });
  }
};
var VString = class _VString extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "string");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VString({
      isOptional: "optional"
    });
  }
};
var VNull = class _VNull extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "null");
  }
  /** @internal */
  get json() {
    return { type: this.kind };
  }
  /** @internal */
  asOptional() {
    return new _VNull({ isOptional: "optional" });
  }
};
var VAny = class _VAny extends BaseValidator {
  constructor() {
    super(...arguments);
    __publicField(this, "kind", "any");
  }
  /** @internal */
  get json() {
    return {
      type: this.kind
    };
  }
  /** @internal */
  asOptional() {
    return new _VAny({
      isOptional: "optional"
    });
  }
};
var VObject = class _VObject extends BaseValidator {
  /**
   * Usually you'd use `v.object({ ... })` instead.
   */
  constructor({
    isOptional,
    fields
  }) {
    super({ isOptional });
    __publicField(this, "fields");
    __publicField(this, "kind", "object");
    globalThis.Object.entries(fields).forEach(([fieldName, validator]) => {
      if (validator === void 0) {
        throwUndefinedValidatorError("v.object()", fieldName);
      }
      if (!validator.isConvexValidator) {
        throw new Error("v.object() entries must be validators");
      }
    });
    this.fields = fields;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: globalThis.Object.fromEntries(
        globalThis.Object.entries(this.fields).map(([k, v2]) => [
          k,
          {
            fieldType: v2.json,
            optional: v2.isOptional === "optional" ? true : false
          }
        ])
      )
    };
  }
  /** @internal */
  asOptional() {
    return new _VObject({
      isOptional: "optional",
      fields: this.fields
    });
  }
  /**
   * Create a new VObject with the specified fields omitted.
   * @param fields The field names to omit from this VObject.
   */
  omit(...fields) {
    const newFields = { ...this.fields };
    for (const field of fields) {
      delete newFields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with only the specified fields.
   * @param fields The field names to pick from this VObject.
   */
  pick(...fields) {
    const newFields = {};
    for (const field of fields) {
      newFields[field] = this.fields[field];
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with all fields marked as optional.
   */
  partial() {
    const newFields = {};
    for (const [key, validator] of globalThis.Object.entries(this.fields)) {
      newFields[key] = validator.asOptional();
    }
    return new _VObject({
      isOptional: this.isOptional,
      fields: newFields
    });
  }
  /**
   * Create a new VObject with additional fields merged in.
   * @param fields An object with additional validators to merge into this VObject.
   */
  extend(fields) {
    return new _VObject({
      isOptional: this.isOptional,
      fields: { ...this.fields, ...fields }
    });
  }
};
var VLiteral = class _VLiteral extends BaseValidator {
  /**
   * Usually you'd use `v.literal(value)` instead.
   */
  constructor({ isOptional, value }) {
    super({ isOptional });
    __publicField(this, "value");
    __publicField(this, "kind", "literal");
    if (typeof value !== "string" && typeof value !== "boolean" && typeof value !== "number" && typeof value !== "bigint") {
      throw new Error("v.literal(value) must be a string, number, or boolean");
    }
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: convexToJson(this.value)
    };
  }
  /** @internal */
  asOptional() {
    return new _VLiteral({
      isOptional: "optional",
      value: this.value
    });
  }
};
var VArray = class _VArray extends BaseValidator {
  /**
   * Usually you'd use `v.array(element)` instead.
   */
  constructor({
    isOptional,
    element
  }) {
    super({ isOptional });
    __publicField(this, "element");
    __publicField(this, "kind", "array");
    if (element === void 0) {
      throwUndefinedValidatorError("v.array()");
    }
    this.element = element;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.element.json
    };
  }
  /** @internal */
  asOptional() {
    return new _VArray({
      isOptional: "optional",
      element: this.element
    });
  }
};
var VRecord = class _VRecord extends BaseValidator {
  /**
   * Usually you'd use `v.record(key, value)` instead.
   */
  constructor({
    isOptional,
    key,
    value
  }) {
    super({ isOptional });
    __publicField(this, "key");
    __publicField(this, "value");
    __publicField(this, "kind", "record");
    if (key === void 0) {
      throwUndefinedValidatorError("v.record()", "key");
    }
    if (value === void 0) {
      throwUndefinedValidatorError("v.record()", "value");
    }
    if (key.isOptional === "optional") {
      throw new Error("Record validator cannot have optional keys");
    }
    if (value.isOptional === "optional") {
      throw new Error("Record validator cannot have optional values");
    }
    if (!key.isConvexValidator || !value.isConvexValidator) {
      throw new Error("Key and value of v.record() but be validators");
    }
    this.key = key;
    this.value = value;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      // This cast is needed because TypeScript thinks the key type is too wide
      keys: this.key.json,
      values: {
        fieldType: this.value.json,
        optional: false
      }
    };
  }
  /** @internal */
  asOptional() {
    return new _VRecord({
      isOptional: "optional",
      key: this.key,
      value: this.value
    });
  }
};
var VUnion = class _VUnion extends BaseValidator {
  /**
   * Usually you'd use `v.union(...members)` instead.
   */
  constructor({ isOptional, members }) {
    super({ isOptional });
    __publicField(this, "members");
    __publicField(this, "kind", "union");
    members.forEach((member, index) => {
      if (member === void 0) {
        throwUndefinedValidatorError("v.union()", `member at index ${index}`);
      }
      if (!member.isConvexValidator) {
        throw new Error("All members of v.union() must be validators");
      }
    });
    this.members = members;
  }
  /** @internal */
  get json() {
    return {
      type: this.kind,
      value: this.members.map((v2) => v2.json)
    };
  }
  /** @internal */
  asOptional() {
    return new _VUnion({
      isOptional: "optional",
      members: this.members
    });
  }
};

// node_modules/convex/dist/esm/values/validator.js
function isValidator(v2) {
  return !!v2.isConvexValidator;
}
var v = {
  /**
   * Validates that the value is a document ID for the given table.
   *
   * IDs are strings at runtime but are typed as `Id<"tableName">` in
   * TypeScript for type safety.
   *
   * @example
   * ```typescript
   * args: { userId: v.id("users") }
   * ```
   *
   * @param tableName The name of the table.
   */
  id: (tableName) => {
    return new VId({
      isOptional: "required",
      tableName
    });
  },
  /**
   * Validates that the value is `null`.
   *
   * Use `returns: v.null()` for functions that don't return a meaningful value.
   * JavaScript `undefined` is not a valid Convex value, it is automatically
   * converted to `null`.
   */
  null: () => {
    return new VNull({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `number` (Convex Float64).
   *
   * Supports all IEEE-754 double-precision floating point numbers including
   * NaN and Infinity.
   *
   * Alias for `v.float64()`.
   */
  number: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `number` (Convex Float64).
   *
   * Supports all IEEE-754 double-precision floating point numbers.
   */
  float64: () => {
    return new VFloat64({ isOptional: "required" });
  },
  /**
   * @deprecated Use `v.int64()` instead.
   */
  bigint: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a JavaScript `bigint` (Convex Int64).
   *
   * Supports BigInts between -2^63 and 2^63-1.
   *
   * @example
   * ```typescript
   * args: { timestamp: v.int64() }
   * // Usage: createDoc({ timestamp: 1234567890n })
   * ```
   */
  int64: () => {
    return new VInt64({ isOptional: "required" });
  },
  /**
   * Validates that the value is a commit timestamp: an int64 (`bigint`)
   * assigned from the transaction's commit timestamp.
   *
   * An index on a field with this validator orders documents by commit order.
   * Accepts any int64 value; write `db.vars.commitTs` to have the field
   * resolve to the commit timestamp when the mutation commits.
   */
  commitTs: () => {
    return new VCommitTs({ isOptional: "required" });
  },
  /**
   * Validates that the value is a `boolean`.
   */
  boolean: () => {
    return new VBoolean({ isOptional: "required" });
  },
  /**
   * Validates that the value is a `string`.
   *
   * Strings are stored as UTF-8 and their storage size is calculated as their
   * UTF-8 encoded size.
   */
  string: () => {
    return new VString({ isOptional: "required" });
  },
  /**
   * Validates that the value is an `ArrayBuffer` (Convex Bytes).
   *
   * Use for binary data.
   */
  bytes: () => {
    return new VBytes({ isOptional: "required" });
  },
  /**
   * Validates that the value is exactly equal to the given literal.
   *
   * Useful for discriminated unions and enum-like patterns.
   *
   * @example
   * ```typescript
   * // Discriminated union pattern:
   * v.union(
   *   v.object({ kind: v.literal("error"), message: v.string() }),
   *   v.object({ kind: v.literal("success"), value: v.number() }),
   * )
   * ```
   *
   * @param literal The literal value to compare against.
   */
  literal: (literal) => {
    return new VLiteral({ isOptional: "required", value: literal });
  },
  /**
   * Validates that the value is an `Array` where every element matches the
   * given validator.
   *
   * Arrays can have at most 8192 elements.
   *
   * @example
   * ```typescript
   * args: { tags: v.array(v.string()) }
   * args: { coordinates: v.array(v.number()) }
   * args: { items: v.array(v.object({ name: v.string(), qty: v.number() })) }
   * ```
   *
   * @param element The validator for the elements of the array.
   */
  array: (element) => {
    return new VArray({ isOptional: "required", element });
  },
  /**
   * Validates that the value is an `Object` with the specified properties.
   *
   * Objects can have at most 1024 entries. Field names must be non-empty and
   * must not start with `"$"` or `"_"` (`_` is reserved for system fields
   * like `_id` and `_creationTime`; `$` is reserved for Convex internal use).
   *
   * @example
   * ```typescript
   * args: {
   *   user: v.object({
   *     name: v.string(),
   *     email: v.string(),
   *     age: v.optional(v.number()),
   *   })
   * }
   * ```
   *
   * @param fields An object mapping property names to their validators.
   */
  object: (fields) => {
    return new VObject({ isOptional: "required", fields });
  },
  /**
   * Validates that the value is a `Record` (object with dynamic keys).
   *
   * Records are objects at runtime but allow dynamic keys, unlike `v.object()`
   * which requires known property names. Keys must be ASCII characters only,
   * non-empty, and not start with `"$"` or `"_"`.
   *
   * @example
   * ```typescript
   * // Map of user IDs to scores:
   * args: { scores: v.record(v.id("users"), v.number()) }
   *
   * // Map of string keys to string values:
   * args: { metadata: v.record(v.string(), v.string()) }
   * ```
   *
   * @param keys The validator for the keys of the record.
   * @param values The validator for the values of the record.
   */
  record: (keys, values) => {
    return new VRecord({
      isOptional: "required",
      key: keys,
      value: values
    });
  },
  /**
   * Validates that the value matches at least one of the given validators.
   *
   * @example
   * ```typescript
   * // Allow string or number:
   * args: { value: v.union(v.string(), v.number()) }
   *
   * // Discriminated union (recommended pattern):
   * v.union(
   *   v.object({ kind: v.literal("text"), body: v.string() }),
   *   v.object({ kind: v.literal("image"), url: v.string() }),
   * )
   *
   * // Nullable value:
   * returns: v.union(v.object({ ... }), v.null())
   * ```
   *
   * @param members The validators to match against.
   */
  union: (...members) => {
    return new VUnion({
      isOptional: "required",
      members
    });
  },
  /**
   * A validator that accepts any Convex value without validation.
   *
   * Prefer using specific validators when possible for better type safety
   * and runtime validation.
   */
  any: () => {
    return new VAny({ isOptional: "required" });
  },
  /**
   * Makes a property optional in an object validator.
   *
   * An optional property can be omitted entirely when creating a document or
   * calling a function. This is different from `v.nullable()` which requires
   * the property to be present but allows `null`.
   *
   * @example
   * ```typescript
   * v.object({
   *   name: v.string(),              // required
   *   nickname: v.optional(v.string()), // can be omitted
   * })
   *
   * // Valid: { name: "Alice" }
   * // Valid: { name: "Alice", nickname: "Ali" }
   * // Invalid: { name: "Alice", nickname: null }  - use v.nullable() for this
   * ```
   *
   * @param value The property value validator to make optional.
   */
  optional: (value) => {
    return value.asOptional();
  },
  /**
   * Allows a value to be either the given type or `null`.
   *
   * This is shorthand for `v.union(value, v.null())`. Unlike `v.optional()`,
   * the property must still be present, but may be `null`.
   *
   * @example
   * ```typescript
   * v.object({
   *   name: v.string(),
   *   deletedAt: v.nullable(v.number()), // must be present, can be null
   * })
   *
   * // Valid: { name: "Alice", deletedAt: null }
   * // Valid: { name: "Alice", deletedAt: 1234567890 }
   * // Invalid: { name: "Alice" }  - deletedAt is required
   * ```
   */
  nullable: (value) => {
    return v.union(value, v.null());
  }
};

// node_modules/convex/dist/esm/values/errors.js
var __defProp2 = Object.defineProperty;
var __defNormalProp2 = (obj, key, value) => key in obj ? __defProp2(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField2 = (obj, key, value) => __defNormalProp2(obj, typeof key !== "symbol" ? key + "" : key, value);
var _a;
var _b;
var IDENTIFYING_FIELD = Symbol.for("ConvexError");
var ConvexError = class extends (_b = Error, _a = IDENTIFYING_FIELD, _b) {
  constructor(data) {
    super(typeof data === "string" ? data : stringifyValueForError(data));
    __publicField2(this, "name", "ConvexError");
    __publicField2(this, "data");
    __publicField2(this, _a, true);
    this.data = data;
  }
};

// node_modules/convex/dist/esm/values/compare_utf8.js
var arr = () => Array.from({ length: 4 }, () => 0);
var aBytes = arr();
var bBytes = arr();

// node_modules/convex/dist/esm/browser/logging.js
var __defProp3 = Object.defineProperty;
var __defNormalProp3 = (obj, key, value) => key in obj ? __defProp3(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField3 = (obj, key, value) => __defNormalProp3(obj, typeof key !== "symbol" ? key + "" : key, value);
var INFO_COLOR = "color:rgb(0, 145, 255)";
function prefix_for_source(source) {
  switch (source) {
    case "query":
      return "Q";
    case "mutation":
      return "M";
    case "action":
      return "A";
    case "any":
      return "?";
  }
}
var DefaultLogger = class {
  constructor(options) {
    __publicField3(this, "_onLogLineFuncs");
    __publicField3(this, "_verbose");
    this._onLogLineFuncs = {};
    this._verbose = options.verbose;
  }
  addLogLineListener(func) {
    let id = Math.random().toString(36).substring(2, 15);
    for (let i = 0; i < 10; i++) {
      if (this._onLogLineFuncs[id] === void 0) {
        break;
      }
      id = Math.random().toString(36).substring(2, 15);
    }
    this._onLogLineFuncs[id] = func;
    return () => {
      delete this._onLogLineFuncs[id];
    };
  }
  logVerbose(...args) {
    if (this._verbose) {
      for (const func of Object.values(this._onLogLineFuncs)) {
        func("debug", `${(/* @__PURE__ */ new Date()).toISOString()}`, ...args);
      }
    }
  }
  log(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("info", ...args);
    }
  }
  warn(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("warn", ...args);
    }
  }
  error(...args) {
    for (const func of Object.values(this._onLogLineFuncs)) {
      func("error", ...args);
    }
  }
};
function instantiateDefaultLogger(options) {
  const logger = new DefaultLogger(options);
  logger.addLogLineListener((level, ...args) => {
    switch (level) {
      case "debug":
        console.debug(...args);
        break;
      case "info":
        console.log(...args);
        break;
      case "warn":
        console.warn(...args);
        break;
      case "error":
        console.error(...args);
        break;
      default: {
        level;
        console.log(...args);
      }
    }
  });
  return logger;
}
function instantiateNoopLogger(options) {
  return new DefaultLogger(options);
}
function logForFunction(logger, type, source, udfPath, message) {
  const prefix = prefix_for_source(source);
  if (typeof message === "object") {
    message = `ConvexError ${JSON.stringify(message.errorData, null, 2)}`;
  }
  if (type === "info") {
    const match2 = message.match(/^\[.*?\] /);
    if (match2 === null) {
      logger.error(
        `[CONVEX ${prefix}(${udfPath})] Could not parse console.log`
      );
      return;
    }
    const level = message.slice(1, match2[0].length - 2);
    const args = message.slice(match2[0].length);
    logger.log(`%c[CONVEX ${prefix}(${udfPath})] [${level}]`, INFO_COLOR, args);
  } else {
    logger.error(`[CONVEX ${prefix}(${udfPath})] ${message}`);
  }
}

// node_modules/convex/dist/esm/server/functionName.js
var functionName = Symbol.for("functionName");

// node_modules/convex/dist/esm/server/components/paths.js
var toReferencePath = Symbol.for("toReferencePath");
function extractReferencePath(reference) {
  return reference[toReferencePath] ?? null;
}
function isFunctionHandle(s) {
  return s.startsWith("function://");
}
function getFunctionAddress(functionReference) {
  let functionAddress;
  if (typeof functionReference === "string") {
    if (isFunctionHandle(functionReference)) {
      functionAddress = { functionHandle: functionReference };
    } else {
      functionAddress = { name: functionReference };
    }
  } else if (functionReference[functionName]) {
    functionAddress = { name: functionReference[functionName] };
  } else {
    const referencePath = extractReferencePath(functionReference);
    if (!referencePath) {
      throw new Error(`${functionReference} is not a functionReference`);
    }
    functionAddress = { reference: referencePath };
  }
  return functionAddress;
}

// node_modules/convex/dist/esm/server/api.js
function getFunctionName(functionReference) {
  const address = getFunctionAddress(functionReference);
  if (address.name === void 0) {
    if (address.functionHandle !== void 0) {
      throw new Error(
        `Expected function reference like "api.file.func" or "internal.file.func", but received function handle ${address.functionHandle}`
      );
    } else if (address.reference !== void 0) {
      throw new Error(
        `Expected function reference in the current component like "api.file.func" or "internal.file.func", but received reference ${address.reference}`
      );
    }
    throw new Error(
      `Expected function reference like "api.file.func" or "internal.file.func", but received ${JSON.stringify(address)}`
    );
  }
  if (typeof functionReference === "string") return functionReference;
  const name = functionReference[functionName];
  if (!name) {
    throw new Error(`${functionReference} is not a functionReference`);
  }
  return name;
}
function createApi(pathParts = []) {
  const handler2 = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createApi(newParts);
      } else if (prop === functionName) {
        if (pathParts.length < 2) {
          const found = ["api", ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`api.moduleName.functionName\`. Found: \`${found}\``
          );
        }
        const path = pathParts.slice(0, -1).join("/");
        const exportName = pathParts[pathParts.length - 1];
        if (exportName === "default") {
          return path;
        } else {
          return path + ":" + exportName;
        }
      } else if (prop === Symbol.toStringTag) {
        return "FunctionReference";
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler2);
}
var anyApi = createApi();

// node_modules/convex/dist/esm/vendor/long.js
var __defProp4 = Object.defineProperty;
var __defNormalProp4 = (obj, key, value) => key in obj ? __defProp4(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField4 = (obj, key, value) => __defNormalProp4(obj, typeof key !== "symbol" ? key + "" : key, value);
var Long = class _Long {
  constructor(low, high) {
    __publicField4(this, "low");
    __publicField4(this, "high");
    __publicField4(this, "__isUnsignedLong__");
    this.low = low | 0;
    this.high = high | 0;
    this.__isUnsignedLong__ = true;
  }
  static isLong(obj) {
    return (obj && obj.__isUnsignedLong__) === true;
  }
  // prettier-ignore
  static fromBytesLE(bytes) {
    return new _Long(
      bytes[0] | bytes[1] << 8 | bytes[2] << 16 | bytes[3] << 24,
      bytes[4] | bytes[5] << 8 | bytes[6] << 16 | bytes[7] << 24
    );
  }
  // prettier-ignore
  toBytesLE() {
    const hi = this.high;
    const lo = this.low;
    return [
      lo & 255,
      lo >>> 8 & 255,
      lo >>> 16 & 255,
      lo >>> 24,
      hi & 255,
      hi >>> 8 & 255,
      hi >>> 16 & 255,
      hi >>> 24
    ];
  }
  static fromNumber(value) {
    if (isNaN(value)) return UZERO;
    if (value < 0) return UZERO;
    if (value >= TWO_PWR_64_DBL) return MAX_UNSIGNED_VALUE;
    return new _Long(value % TWO_PWR_32_DBL | 0, value / TWO_PWR_32_DBL | 0);
  }
  toString() {
    return (BigInt(this.high) * BigInt(TWO_PWR_32_DBL) + BigInt(this.low)).toString();
  }
  equals(other) {
    if (!_Long.isLong(other)) other = _Long.fromValue(other);
    if (this.high >>> 31 === 1 && other.high >>> 31 === 1) return false;
    return this.high === other.high && this.low === other.low;
  }
  notEquals(other) {
    return !this.equals(other);
  }
  comp(other) {
    if (!_Long.isLong(other)) other = _Long.fromValue(other);
    if (this.equals(other)) return 0;
    return other.high >>> 0 > this.high >>> 0 || other.high === this.high && other.low >>> 0 > this.low >>> 0 ? -1 : 1;
  }
  lessThanOrEqual(other) {
    return this.comp(
      /* validates */
      other
    ) <= 0;
  }
  static fromValue(val) {
    if (typeof val === "number") return _Long.fromNumber(val);
    return new _Long(val.low, val.high);
  }
};
var UZERO = new Long(0, 0);
var TWO_PWR_16_DBL = 1 << 16;
var TWO_PWR_32_DBL = TWO_PWR_16_DBL * TWO_PWR_16_DBL;
var TWO_PWR_64_DBL = TWO_PWR_32_DBL * TWO_PWR_32_DBL;
var MAX_UNSIGNED_VALUE = new Long(4294967295 | 0, 4294967295 | 0);

// node_modules/convex/dist/esm/vendor/jwt-decode/index.js
var InvalidTokenError = class extends Error {
};
InvalidTokenError.prototype.name = "InvalidTokenError";

// node_modules/convex/dist/esm/browser/sync/authentication_manager.js
var MAXIMUM_REFRESH_DELAY = 20 * 24 * 60 * 60 * 1e3;

// node_modules/convex/dist/esm/browser/simple_client-node.js
import { createRequire } from "module";
import { resolve as nodePathResolve } from "path";

// node_modules/convex/dist/esm/browser/simple_client.js
var defaultWebSocketConstructor;
function setDefaultWebSocketConstructor(ws) {
  defaultWebSocketConstructor = ws;
}

// node_modules/convex/dist/esm/browser/simple_client-node.js
var require2 = createRequire(nodePathResolve("."));
var __create = Object.create;
var __defProp5 = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require2 !== "undefined" ? require2 : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require2 !== "undefined" ? require2 : a)[b]
}) : x)(function(x) {
  if (typeof require2 !== "undefined") return require2.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp5(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp5(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var require_constants = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/constants.js"(exports, module) {
    "use strict";
    var BINARY_TYPES = ["nodebuffer", "arraybuffer", "fragments"];
    var hasBlob = typeof Blob !== "undefined";
    if (hasBlob) BINARY_TYPES.push("blob");
    module.exports = {
      BINARY_TYPES,
      CLOSE_TIMEOUT: 3e4,
      EMPTY_BUFFER: Buffer.alloc(0),
      GUID: "258EAFA5-E914-47DA-95CA-C5AB0DC85B11",
      hasBlob,
      kForOnEventAttribute: Symbol("kIsForOnEventAttribute"),
      kListener: Symbol("kListener"),
      kStatusCode: Symbol("status-code"),
      kWebSocket: Symbol("websocket"),
      NOOP: () => {
      }
    };
  }
});
var require_node_gyp_build = __commonJS({
  "../node_modules/.pnpm/node-gyp-build@4.8.4/node_modules/node-gyp-build/node-gyp-build.js"(exports, module) {
    var fs = __require("fs");
    var path = __require("path");
    var os = __require("os");
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    var vars2 = process.config && process.config.variables || {};
    var prebuildsOnly = !!process.env.PREBUILDS_ONLY;
    var abi = process.versions.modules;
    var runtime = isElectron() ? "electron" : isNwjs() ? "node-webkit" : "node";
    var arch = process.env.npm_config_arch || os.arch();
    var platform = process.env.npm_config_platform || os.platform();
    var libc = process.env.LIBC || (isAlpine(platform) ? "musl" : "glibc");
    var armv = process.env.ARM_VERSION || (arch === "arm64" ? "8" : vars2.arm_version) || "";
    var uv = (process.versions.uv || "").split(".")[0];
    module.exports = load;
    function load(dir) {
      return runtimeRequire(load.resolve(dir));
    }
    load.resolve = load.path = function(dir) {
      dir = path.resolve(dir || ".");
      try {
        var name = runtimeRequire(path.join(dir, "package.json")).name.toUpperCase().replace(/-/g, "_");
        if (process.env[name + "_PREBUILD"]) dir = process.env[name + "_PREBUILD"];
      } catch (err) {
      }
      if (!prebuildsOnly) {
        var release = getFirst(path.join(dir, "build/Release"), matchBuild);
        if (release) return release;
        var debug = getFirst(path.join(dir, "build/Debug"), matchBuild);
        if (debug) return debug;
      }
      var prebuild = resolve(dir);
      if (prebuild) return prebuild;
      var nearby = resolve(path.dirname(process.execPath));
      if (nearby) return nearby;
      var target = [
        "platform=" + platform,
        "arch=" + arch,
        "runtime=" + runtime,
        "abi=" + abi,
        "uv=" + uv,
        armv ? "armv=" + armv : "",
        "libc=" + libc,
        "node=" + process.versions.node,
        process.versions.electron ? "electron=" + process.versions.electron : "",
        typeof __webpack_require__ === "function" ? "webpack=true" : ""
        // eslint-disable-line
      ].filter(Boolean).join(" ");
      throw new Error("No native build was found for " + target + "\n    loaded from: " + dir + "\n");
      function resolve(dir2) {
        var tuples = readdirSync(path.join(dir2, "prebuilds")).map(parseTuple);
        var tuple = tuples.filter(matchTuple(platform, arch)).sort(compareTuples)[0];
        if (!tuple) return;
        var prebuilds = path.join(dir2, "prebuilds", tuple.name);
        var parsed = readdirSync(prebuilds).map(parseTags);
        var candidates = parsed.filter(matchTags(runtime, abi));
        var winner = candidates.sort(compareTags(runtime))[0];
        if (winner) return path.join(prebuilds, winner.file);
      }
    };
    function readdirSync(dir) {
      try {
        return fs.readdirSync(dir);
      } catch (err) {
        return [];
      }
    }
    function getFirst(dir, filter) {
      var files = readdirSync(dir).filter(filter);
      return files[0] && path.join(dir, files[0]);
    }
    function matchBuild(name) {
      return /\.node$/.test(name);
    }
    function parseTuple(name) {
      var arr2 = name.split("-");
      if (arr2.length !== 2) return;
      var platform2 = arr2[0];
      var architectures = arr2[1].split("+");
      if (!platform2) return;
      if (!architectures.length) return;
      if (!architectures.every(Boolean)) return;
      return { name, platform: platform2, architectures };
    }
    function matchTuple(platform2, arch2) {
      return function(tuple) {
        if (tuple == null) return false;
        if (tuple.platform !== platform2) return false;
        return tuple.architectures.includes(arch2);
      };
    }
    function compareTuples(a, b) {
      return a.architectures.length - b.architectures.length;
    }
    function parseTags(file) {
      var arr2 = file.split(".");
      var extension2 = arr2.pop();
      var tags = { file, specificity: 0 };
      if (extension2 !== "node") return;
      for (var i = 0; i < arr2.length; i++) {
        var tag = arr2[i];
        if (tag === "node" || tag === "electron" || tag === "node-webkit") {
          tags.runtime = tag;
        } else if (tag === "napi") {
          tags.napi = true;
        } else if (tag.slice(0, 3) === "abi") {
          tags.abi = tag.slice(3);
        } else if (tag.slice(0, 2) === "uv") {
          tags.uv = tag.slice(2);
        } else if (tag.slice(0, 4) === "armv") {
          tags.armv = tag.slice(4);
        } else if (tag === "glibc" || tag === "musl") {
          tags.libc = tag;
        } else {
          continue;
        }
        tags.specificity++;
      }
      return tags;
    }
    function matchTags(runtime2, abi2) {
      return function(tags) {
        if (tags == null) return false;
        if (tags.runtime && tags.runtime !== runtime2 && !runtimeAgnostic(tags)) return false;
        if (tags.abi && tags.abi !== abi2 && !tags.napi) return false;
        if (tags.uv && tags.uv !== uv) return false;
        if (tags.armv && tags.armv !== armv) return false;
        if (tags.libc && tags.libc !== libc) return false;
        return true;
      };
    }
    function runtimeAgnostic(tags) {
      return tags.runtime === "node" && tags.napi;
    }
    function compareTags(runtime2) {
      return function(a, b) {
        if (a.runtime !== b.runtime) {
          return a.runtime === runtime2 ? -1 : 1;
        } else if (a.abi !== b.abi) {
          return a.abi ? -1 : 1;
        } else if (a.specificity !== b.specificity) {
          return a.specificity > b.specificity ? -1 : 1;
        } else {
          return 0;
        }
      };
    }
    function isNwjs() {
      return !!(process.versions && process.versions.nw);
    }
    function isElectron() {
      if (process.versions && process.versions.electron) return true;
      if (process.env.ELECTRON_RUN_AS_NODE) return true;
      return typeof window !== "undefined" && window.process && window.process.type === "renderer";
    }
    function isAlpine(platform2) {
      return platform2 === "linux" && fs.existsSync("/etc/alpine-release");
    }
    load.parseTags = parseTags;
    load.matchTags = matchTags;
    load.compareTags = compareTags;
    load.parseTuple = parseTuple;
    load.matchTuple = matchTuple;
    load.compareTuples = compareTuples;
  }
});
var require_node_gyp_build2 = __commonJS({
  "../node_modules/.pnpm/node-gyp-build@4.8.4/node_modules/node-gyp-build/index.js"(exports, module) {
    var runtimeRequire = typeof __webpack_require__ === "function" ? __non_webpack_require__ : __require;
    if (typeof runtimeRequire.addon === "function") {
      module.exports = runtimeRequire.addon.bind(runtimeRequire);
    } else {
      module.exports = require_node_gyp_build();
    }
  }
});
var require_fallback = __commonJS({
  "../node_modules/.pnpm/bufferutil@4.0.9/node_modules/bufferutil/fallback.js"(exports, module) {
    "use strict";
    var mask = (source, mask2, output, offset, length) => {
      for (var i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask2[i & 3];
      }
    };
    var unmask = (buffer, mask2) => {
      const length = buffer.length;
      for (var i = 0; i < length; i++) {
        buffer[i] ^= mask2[i & 3];
      }
    };
    module.exports = { mask, unmask };
  }
});
var require_bufferutil = __commonJS({
  "../node_modules/.pnpm/bufferutil@4.0.9/node_modules/bufferutil/index.js"(exports, module) {
    "use strict";
    try {
      module.exports = require_node_gyp_build2()(__dirname);
    } catch (e) {
      module.exports = require_fallback();
    }
  }
});
var require_buffer_util = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/buffer-util.js"(exports, module) {
    "use strict";
    var { EMPTY_BUFFER } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    function concat(list, totalLength) {
      if (list.length === 0) return EMPTY_BUFFER;
      if (list.length === 1) return list[0];
      const target = Buffer.allocUnsafe(totalLength);
      let offset = 0;
      for (let i = 0; i < list.length; i++) {
        const buf = list[i];
        target.set(buf, offset);
        offset += buf.length;
      }
      if (offset < totalLength) {
        return new FastBuffer(target.buffer, target.byteOffset, offset);
      }
      return target;
    }
    function _mask(source, mask, output, offset, length) {
      for (let i = 0; i < length; i++) {
        output[offset + i] = source[i] ^ mask[i & 3];
      }
    }
    function _unmask(buffer, mask) {
      for (let i = 0; i < buffer.length; i++) {
        buffer[i] ^= mask[i & 3];
      }
    }
    function toArrayBuffer(buf) {
      if (buf.length === buf.buffer.byteLength) {
        return buf.buffer;
      }
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.length);
    }
    function toBuffer(data) {
      toBuffer.readOnly = true;
      if (Buffer.isBuffer(data)) return data;
      let buf;
      if (data instanceof ArrayBuffer) {
        buf = new FastBuffer(data);
      } else if (ArrayBuffer.isView(data)) {
        buf = new FastBuffer(data.buffer, data.byteOffset, data.byteLength);
      } else {
        buf = Buffer.from(data);
        toBuffer.readOnly = false;
      }
      return buf;
    }
    module.exports = {
      concat,
      mask: _mask,
      toArrayBuffer,
      toBuffer,
      unmask: _unmask
    };
    if (!process.env.WS_NO_BUFFER_UTIL) {
      try {
        const bufferUtil = require_bufferutil();
        module.exports.mask = function(source, mask, output, offset, length) {
          if (length < 48) _mask(source, mask, output, offset, length);
          else bufferUtil.mask(source, mask, output, offset, length);
        };
        module.exports.unmask = function(buffer, mask) {
          if (buffer.length < 32) _unmask(buffer, mask);
          else bufferUtil.unmask(buffer, mask);
        };
      } catch (e) {
      }
    }
  }
});
var require_limiter = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/limiter.js"(exports, module) {
    "use strict";
    var kDone = Symbol("kDone");
    var kRun = Symbol("kRun");
    var Limiter = class {
      /**
       * Creates a new `Limiter`.
       *
       * @param {Number} [concurrency=Infinity] The maximum number of jobs allowed
       *     to run concurrently
       */
      constructor(concurrency) {
        this[kDone] = () => {
          this.pending--;
          this[kRun]();
        };
        this.concurrency = concurrency || Infinity;
        this.jobs = [];
        this.pending = 0;
      }
      /**
       * Adds a job to the queue.
       *
       * @param {Function} job The job to run
       * @public
       */
      add(job) {
        this.jobs.push(job);
        this[kRun]();
      }
      /**
       * Removes a job from the queue and runs it if possible.
       *
       * @private
       */
      [kRun]() {
        if (this.pending === this.concurrency) return;
        if (this.jobs.length) {
          const job = this.jobs.shift();
          this.pending++;
          job(this[kDone]);
        }
      }
    };
    module.exports = Limiter;
  }
});
var require_permessage_deflate = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/permessage-deflate.js"(exports, module) {
    "use strict";
    var zlib = __require("zlib");
    var bufferUtil = require_buffer_util();
    var Limiter = require_limiter();
    var { kStatusCode } = require_constants();
    var FastBuffer = Buffer[Symbol.species];
    var TRAILER = Buffer.from([0, 0, 255, 255]);
    var kPerMessageDeflate = Symbol("permessage-deflate");
    var kTotalLength = Symbol("total-length");
    var kCallback = Symbol("callback");
    var kBuffers = Symbol("buffers");
    var kError = Symbol("error");
    var zlibLimiter;
    var PerMessageDeflate2 = class {
      /**
       * Creates a PerMessageDeflate instance.
       *
       * @param {Object} [options] Configuration options
       * @param {(Boolean|Number)} [options.clientMaxWindowBits] Advertise support
       *     for, or request, a custom client window size
       * @param {Boolean} [options.clientNoContextTakeover=false] Advertise/
       *     acknowledge disabling of client context takeover
       * @param {Number} [options.concurrencyLimit=10] The number of concurrent
       *     calls to zlib
       * @param {Boolean} [options.isServer=false] Create the instance in either
       *     server or client mode
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {(Boolean|Number)} [options.serverMaxWindowBits] Request/confirm the
       *     use of a custom server window size
       * @param {Boolean} [options.serverNoContextTakeover=false] Request/accept
       *     disabling of server context takeover
       * @param {Number} [options.threshold=1024] Size (in bytes) below which
       *     messages should not be compressed if context takeover is disabled
       * @param {Object} [options.zlibDeflateOptions] Options to pass to zlib on
       *     deflate
       * @param {Object} [options.zlibInflateOptions] Options to pass to zlib on
       *     inflate
       */
      constructor(options) {
        this._options = options || {};
        this._threshold = this._options.threshold !== void 0 ? this._options.threshold : 1024;
        this._maxPayload = this._options.maxPayload | 0;
        this._isServer = !!this._options.isServer;
        this._deflate = null;
        this._inflate = null;
        this.params = null;
        if (!zlibLimiter) {
          const concurrency = this._options.concurrencyLimit !== void 0 ? this._options.concurrencyLimit : 10;
          zlibLimiter = new Limiter(concurrency);
        }
      }
      /**
       * @type {String}
       */
      static get extensionName() {
        return "permessage-deflate";
      }
      /**
       * Create an extension negotiation offer.
       *
       * @return {Object} Extension parameters
       * @public
       */
      offer() {
        const params = {};
        if (this._options.serverNoContextTakeover) {
          params.server_no_context_takeover = true;
        }
        if (this._options.clientNoContextTakeover) {
          params.client_no_context_takeover = true;
        }
        if (this._options.serverMaxWindowBits) {
          params.server_max_window_bits = this._options.serverMaxWindowBits;
        }
        if (this._options.clientMaxWindowBits) {
          params.client_max_window_bits = this._options.clientMaxWindowBits;
        } else if (this._options.clientMaxWindowBits == null) {
          params.client_max_window_bits = true;
        }
        return params;
      }
      /**
       * Accept an extension negotiation offer/response.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Object} Accepted configuration
       * @public
       */
      accept(configurations) {
        configurations = this.normalizeParams(configurations);
        this.params = this._isServer ? this.acceptAsServer(configurations) : this.acceptAsClient(configurations);
        return this.params;
      }
      /**
       * Releases all resources used by the extension.
       *
       * @public
       */
      cleanup() {
        if (this._inflate) {
          this._inflate.close();
          this._inflate = null;
        }
        if (this._deflate) {
          const callback = this._deflate[kCallback];
          this._deflate.close();
          this._deflate = null;
          if (callback) {
            callback(
              new Error(
                "The deflate stream was closed while data was being processed"
              )
            );
          }
        }
      }
      /**
       *  Accept an extension negotiation offer.
       *
       * @param {Array} offers The extension negotiation offers
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsServer(offers) {
        const opts = this._options;
        const accepted = offers.find((params) => {
          if (opts.serverNoContextTakeover === false && params.server_no_context_takeover || params.server_max_window_bits && (opts.serverMaxWindowBits === false || typeof opts.serverMaxWindowBits === "number" && opts.serverMaxWindowBits > params.server_max_window_bits) || typeof opts.clientMaxWindowBits === "number" && !params.client_max_window_bits) {
            return false;
          }
          return true;
        });
        if (!accepted) {
          throw new Error("None of the extension offers can be accepted");
        }
        if (opts.serverNoContextTakeover) {
          accepted.server_no_context_takeover = true;
        }
        if (opts.clientNoContextTakeover) {
          accepted.client_no_context_takeover = true;
        }
        if (typeof opts.serverMaxWindowBits === "number") {
          accepted.server_max_window_bits = opts.serverMaxWindowBits;
        }
        if (typeof opts.clientMaxWindowBits === "number") {
          accepted.client_max_window_bits = opts.clientMaxWindowBits;
        } else if (accepted.client_max_window_bits === true || opts.clientMaxWindowBits === false) {
          delete accepted.client_max_window_bits;
        }
        return accepted;
      }
      /**
       * Accept the extension negotiation response.
       *
       * @param {Array} response The extension negotiation response
       * @return {Object} Accepted configuration
       * @private
       */
      acceptAsClient(response) {
        const params = response[0];
        if (this._options.clientNoContextTakeover === false && params.client_no_context_takeover) {
          throw new Error('Unexpected parameter "client_no_context_takeover"');
        }
        if (!params.client_max_window_bits) {
          if (typeof this._options.clientMaxWindowBits === "number") {
            params.client_max_window_bits = this._options.clientMaxWindowBits;
          }
        } else if (this._options.clientMaxWindowBits === false || typeof this._options.clientMaxWindowBits === "number" && params.client_max_window_bits > this._options.clientMaxWindowBits) {
          throw new Error(
            'Unexpected or invalid parameter "client_max_window_bits"'
          );
        }
        return params;
      }
      /**
       * Normalize parameters.
       *
       * @param {Array} configurations The extension negotiation offers/reponse
       * @return {Array} The offers/response with normalized parameters
       * @private
       */
      normalizeParams(configurations) {
        configurations.forEach((params) => {
          Object.keys(params).forEach((key) => {
            let value = params[key];
            if (value.length > 1) {
              throw new Error(`Parameter "${key}" must have only a single value`);
            }
            value = value[0];
            if (key === "client_max_window_bits") {
              if (value !== true) {
                const num2 = +value;
                if (!Number.isInteger(num2) || num2 < 8 || num2 > 15) {
                  throw new TypeError(
                    `Invalid value for parameter "${key}": ${value}`
                  );
                }
                value = num2;
              } else if (!this._isServer) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else if (key === "server_max_window_bits") {
              const num2 = +value;
              if (!Number.isInteger(num2) || num2 < 8 || num2 > 15) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
              value = num2;
            } else if (key === "client_no_context_takeover" || key === "server_no_context_takeover") {
              if (value !== true) {
                throw new TypeError(
                  `Invalid value for parameter "${key}": ${value}`
                );
              }
            } else {
              throw new Error(`Unknown parameter "${key}"`);
            }
            params[key] = value;
          });
        });
        return configurations;
      }
      /**
       * Decompress data. Concurrency limited.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      decompress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._decompress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Compress data. Concurrency limited.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @public
       */
      compress(data, fin, callback) {
        zlibLimiter.add((done) => {
          this._compress(data, fin, (err, result) => {
            done();
            callback(err, result);
          });
        });
      }
      /**
       * Decompress data.
       *
       * @param {Buffer} data Compressed data
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _decompress(data, fin, callback) {
        const endpoint = this._isServer ? "client" : "server";
        if (!this._inflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._inflate = zlib.createInflateRaw({
            ...this._options.zlibInflateOptions,
            windowBits
          });
          this._inflate[kPerMessageDeflate] = this;
          this._inflate[kTotalLength] = 0;
          this._inflate[kBuffers] = [];
          this._inflate.on("error", inflateOnError);
          this._inflate.on("data", inflateOnData);
        }
        this._inflate[kCallback] = callback;
        this._inflate.write(data);
        if (fin) this._inflate.write(TRAILER);
        this._inflate.flush(() => {
          const err = this._inflate[kError];
          if (err) {
            this._inflate.close();
            this._inflate = null;
            callback(err);
            return;
          }
          const data2 = bufferUtil.concat(
            this._inflate[kBuffers],
            this._inflate[kTotalLength]
          );
          if (this._inflate._readableState.endEmitted) {
            this._inflate.close();
            this._inflate = null;
          } else {
            this._inflate[kTotalLength] = 0;
            this._inflate[kBuffers] = [];
            if (fin && this.params[`${endpoint}_no_context_takeover`]) {
              this._inflate.reset();
            }
          }
          callback(null, data2);
        });
      }
      /**
       * Compress data.
       *
       * @param {(Buffer|String)} data Data to compress
       * @param {Boolean} fin Specifies whether or not this is the last fragment
       * @param {Function} callback Callback
       * @private
       */
      _compress(data, fin, callback) {
        const endpoint = this._isServer ? "server" : "client";
        if (!this._deflate) {
          const key = `${endpoint}_max_window_bits`;
          const windowBits = typeof this.params[key] !== "number" ? zlib.Z_DEFAULT_WINDOWBITS : this.params[key];
          this._deflate = zlib.createDeflateRaw({
            ...this._options.zlibDeflateOptions,
            windowBits
          });
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          this._deflate.on("data", deflateOnData);
        }
        this._deflate[kCallback] = callback;
        this._deflate.write(data);
        this._deflate.flush(zlib.Z_SYNC_FLUSH, () => {
          if (!this._deflate) {
            return;
          }
          let data2 = bufferUtil.concat(
            this._deflate[kBuffers],
            this._deflate[kTotalLength]
          );
          if (fin) {
            data2 = new FastBuffer(data2.buffer, data2.byteOffset, data2.length - 4);
          }
          this._deflate[kCallback] = null;
          this._deflate[kTotalLength] = 0;
          this._deflate[kBuffers] = [];
          if (fin && this.params[`${endpoint}_no_context_takeover`]) {
            this._deflate.reset();
          }
          callback(null, data2);
        });
      }
    };
    module.exports = PerMessageDeflate2;
    function deflateOnData(chunk) {
      this[kBuffers].push(chunk);
      this[kTotalLength] += chunk.length;
    }
    function inflateOnData(chunk) {
      this[kTotalLength] += chunk.length;
      if (this[kPerMessageDeflate]._maxPayload < 1 || this[kTotalLength] <= this[kPerMessageDeflate]._maxPayload) {
        this[kBuffers].push(chunk);
        return;
      }
      this[kError] = new RangeError("Max payload size exceeded");
      this[kError].code = "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH";
      this[kError][kStatusCode] = 1009;
      this.removeListener("data", inflateOnData);
      this.reset();
    }
    function inflateOnError(err) {
      this[kPerMessageDeflate]._inflate = null;
      if (this[kError]) {
        this[kCallback](this[kError]);
        return;
      }
      err[kStatusCode] = 1007;
      this[kCallback](err);
    }
  }
});
var require_validation = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/validation.js"(exports, module) {
    "use strict";
    var { isUtf8 } = __require("buffer");
    var { hasBlob } = require_constants();
    var tokenChars = [
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 0 - 15
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      // 16 - 31
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      1,
      1,
      0,
      1,
      1,
      0,
      // 32 - 47
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      0,
      0,
      0,
      // 48 - 63
      0,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 64 - 79
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      0,
      0,
      1,
      1,
      // 80 - 95
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      // 96 - 111
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      1,
      0,
      1,
      0,
      1,
      0
      // 112 - 127
    ];
    function isValidStatusCode(code2) {
      return code2 >= 1e3 && code2 <= 1014 && code2 !== 1004 && code2 !== 1005 && code2 !== 1006 || code2 >= 3e3 && code2 <= 4999;
    }
    function _isValidUTF8(buf) {
      const len = buf.length;
      let i = 0;
      while (i < len) {
        if ((buf[i] & 128) === 0) {
          i++;
        } else if ((buf[i] & 224) === 192) {
          if (i + 1 === len || (buf[i + 1] & 192) !== 128 || (buf[i] & 254) === 192) {
            return false;
          }
          i += 2;
        } else if ((buf[i] & 240) === 224) {
          if (i + 2 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || buf[i] === 224 && (buf[i + 1] & 224) === 128 || // Overlong
          buf[i] === 237 && (buf[i + 1] & 224) === 160) {
            return false;
          }
          i += 3;
        } else if ((buf[i] & 248) === 240) {
          if (i + 3 >= len || (buf[i + 1] & 192) !== 128 || (buf[i + 2] & 192) !== 128 || (buf[i + 3] & 192) !== 128 || buf[i] === 240 && (buf[i + 1] & 240) === 128 || // Overlong
          buf[i] === 244 && buf[i + 1] > 143 || buf[i] > 244) {
            return false;
          }
          i += 4;
        } else {
          return false;
        }
      }
      return true;
    }
    function isBlob(value) {
      return hasBlob && typeof value === "object" && typeof value.arrayBuffer === "function" && typeof value.type === "string" && typeof value.stream === "function" && (value[Symbol.toStringTag] === "Blob" || value[Symbol.toStringTag] === "File");
    }
    module.exports = {
      isBlob,
      isValidStatusCode,
      isValidUTF8: _isValidUTF8,
      tokenChars
    };
    if (isUtf8) {
      module.exports.isValidUTF8 = function(buf) {
        return buf.length < 24 ? _isValidUTF8(buf) : isUtf8(buf);
      };
    } else if (!process.env.WS_NO_UTF_8_VALIDATE) {
      try {
        const isValidUTF8 = __require("utf-8-validate");
        module.exports.isValidUTF8 = function(buf) {
          return buf.length < 32 ? _isValidUTF8(buf) : isValidUTF8(buf);
        };
      } catch (e) {
      }
    }
  }
});
var require_receiver = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/receiver.js"(exports, module) {
    "use strict";
    var { Writable } = __require("stream");
    var PerMessageDeflate2 = require_permessage_deflate();
    var {
      BINARY_TYPES,
      EMPTY_BUFFER,
      kStatusCode,
      kWebSocket
    } = require_constants();
    var { concat, toArrayBuffer, unmask } = require_buffer_util();
    var { isValidStatusCode, isValidUTF8 } = require_validation();
    var FastBuffer = Buffer[Symbol.species];
    var GET_INFO = 0;
    var GET_PAYLOAD_LENGTH_16 = 1;
    var GET_PAYLOAD_LENGTH_64 = 2;
    var GET_MASK = 3;
    var GET_DATA = 4;
    var INFLATING = 5;
    var DEFER_EVENT = 6;
    var Receiver2 = class extends Writable {
      /**
       * Creates a Receiver instance.
       *
       * @param {Object} [options] Options object
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {String} [options.binaryType=nodebuffer] The type for binary data
       * @param {Object} [options.extensions] An object containing the negotiated
       *     extensions
       * @param {Boolean} [options.isServer=false] Specifies whether to operate in
       *     client or server mode
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message length
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       */
      constructor(options = {}) {
        super();
        this._allowSynchronousEvents = options.allowSynchronousEvents !== void 0 ? options.allowSynchronousEvents : true;
        this._binaryType = options.binaryType || BINARY_TYPES[0];
        this._extensions = options.extensions || {};
        this._isServer = !!options.isServer;
        this._maxBufferedChunks = options.maxBufferedChunks | 0;
        this._maxFragments = options.maxFragments | 0;
        this._maxPayload = options.maxPayload | 0;
        this._skipUTF8Validation = !!options.skipUTF8Validation;
        this[kWebSocket] = void 0;
        this._bufferedBytes = 0;
        this._buffers = [];
        this._compressed = false;
        this._payloadLength = 0;
        this._mask = void 0;
        this._fragmented = 0;
        this._masked = false;
        this._fin = false;
        this._opcode = 0;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragments = [];
        this._errored = false;
        this._loop = false;
        this._state = GET_INFO;
      }
      /**
       * Implements `Writable.prototype._write()`.
       *
       * @param {Buffer} chunk The chunk of data to write
       * @param {String} encoding The character encoding of `chunk`
       * @param {Function} cb Callback
       * @private
       */
      _write(chunk, encoding, cb) {
        if (this._opcode === 8 && this._state == GET_INFO) return cb();
        if (this._maxBufferedChunks > 0 && this._buffers.length >= this._maxBufferedChunks) {
          cb(
            this.createError(
              RangeError,
              "Too many buffered chunks",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            )
          );
          return;
        }
        this._bufferedBytes += chunk.length;
        this._buffers.push(chunk);
        this.startLoop(cb);
      }
      /**
       * Consumes `n` bytes from the buffered data.
       *
       * @param {Number} n The number of bytes to consume
       * @return {Buffer} The consumed bytes
       * @private
       */
      consume(n) {
        this._bufferedBytes -= n;
        if (n === this._buffers[0].length) return this._buffers.shift();
        if (n < this._buffers[0].length) {
          const buf = this._buffers[0];
          this._buffers[0] = new FastBuffer(
            buf.buffer,
            buf.byteOffset + n,
            buf.length - n
          );
          return new FastBuffer(buf.buffer, buf.byteOffset, n);
        }
        const dst = Buffer.allocUnsafe(n);
        do {
          const buf = this._buffers[0];
          const offset = dst.length - n;
          if (n >= buf.length) {
            dst.set(this._buffers.shift(), offset);
          } else {
            dst.set(new Uint8Array(buf.buffer, buf.byteOffset, n), offset);
            this._buffers[0] = new FastBuffer(
              buf.buffer,
              buf.byteOffset + n,
              buf.length - n
            );
          }
          n -= buf.length;
        } while (n > 0);
        return dst;
      }
      /**
       * Starts the parsing loop.
       *
       * @param {Function} cb Callback
       * @private
       */
      startLoop(cb) {
        this._loop = true;
        do {
          switch (this._state) {
            case GET_INFO:
              this.getInfo(cb);
              break;
            case GET_PAYLOAD_LENGTH_16:
              this.getPayloadLength16(cb);
              break;
            case GET_PAYLOAD_LENGTH_64:
              this.getPayloadLength64(cb);
              break;
            case GET_MASK:
              this.getMask();
              break;
            case GET_DATA:
              this.getData(cb);
              break;
            case INFLATING:
            case DEFER_EVENT:
              this._loop = false;
              return;
          }
        } while (this._loop);
        if (!this._errored) cb();
      }
      /**
       * Reads the first two bytes of a frame.
       *
       * @param {Function} cb Callback
       * @private
       */
      getInfo(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        const buf = this.consume(2);
        if ((buf[0] & 48) !== 0) {
          const error = this.createError(
            RangeError,
            "RSV2 and RSV3 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_2_3"
          );
          cb(error);
          return;
        }
        const compressed = (buf[0] & 64) === 64;
        if (compressed && !this._extensions[PerMessageDeflate2.extensionName]) {
          const error = this.createError(
            RangeError,
            "RSV1 must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_RSV_1"
          );
          cb(error);
          return;
        }
        this._fin = (buf[0] & 128) === 128;
        this._opcode = buf[0] & 15;
        this._payloadLength = buf[1] & 127;
        if (this._opcode === 0) {
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (!this._fragmented) {
            const error = this.createError(
              RangeError,
              "invalid opcode 0",
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._opcode = this._fragmented;
        } else if (this._opcode === 1 || this._opcode === 2) {
          if (this._fragmented) {
            const error = this.createError(
              RangeError,
              `invalid opcode ${this._opcode}`,
              true,
              1002,
              "WS_ERR_INVALID_OPCODE"
            );
            cb(error);
            return;
          }
          this._compressed = compressed;
        } else if (this._opcode > 7 && this._opcode < 11) {
          if (!this._fin) {
            const error = this.createError(
              RangeError,
              "FIN must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_FIN"
            );
            cb(error);
            return;
          }
          if (compressed) {
            const error = this.createError(
              RangeError,
              "RSV1 must be clear",
              true,
              1002,
              "WS_ERR_UNEXPECTED_RSV_1"
            );
            cb(error);
            return;
          }
          if (this._payloadLength > 125 || this._opcode === 8 && this._payloadLength === 1) {
            const error = this.createError(
              RangeError,
              `invalid payload length ${this._payloadLength}`,
              true,
              1002,
              "WS_ERR_INVALID_CONTROL_PAYLOAD_LENGTH"
            );
            cb(error);
            return;
          }
        } else {
          const error = this.createError(
            RangeError,
            `invalid opcode ${this._opcode}`,
            true,
            1002,
            "WS_ERR_INVALID_OPCODE"
          );
          cb(error);
          return;
        }
        if (!this._fin && !this._fragmented) this._fragmented = this._opcode;
        this._masked = (buf[1] & 128) === 128;
        if (this._isServer) {
          if (!this._masked) {
            const error = this.createError(
              RangeError,
              "MASK must be set",
              true,
              1002,
              "WS_ERR_EXPECTED_MASK"
            );
            cb(error);
            return;
          }
        } else if (this._masked) {
          const error = this.createError(
            RangeError,
            "MASK must be clear",
            true,
            1002,
            "WS_ERR_UNEXPECTED_MASK"
          );
          cb(error);
          return;
        }
        if (this._payloadLength === 126) this._state = GET_PAYLOAD_LENGTH_16;
        else if (this._payloadLength === 127) this._state = GET_PAYLOAD_LENGTH_64;
        else this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+16).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength16(cb) {
        if (this._bufferedBytes < 2) {
          this._loop = false;
          return;
        }
        this._payloadLength = this.consume(2).readUInt16BE(0);
        this.haveLength(cb);
      }
      /**
       * Gets extended payload length (7+64).
       *
       * @param {Function} cb Callback
       * @private
       */
      getPayloadLength64(cb) {
        if (this._bufferedBytes < 8) {
          this._loop = false;
          return;
        }
        const buf = this.consume(8);
        const num2 = buf.readUInt32BE(0);
        if (num2 > Math.pow(2, 53 - 32) - 1) {
          const error = this.createError(
            RangeError,
            "Unsupported WebSocket frame: payload length > 2^53 - 1",
            false,
            1009,
            "WS_ERR_UNSUPPORTED_DATA_PAYLOAD_LENGTH"
          );
          cb(error);
          return;
        }
        this._payloadLength = num2 * Math.pow(2, 32) + buf.readUInt32BE(4);
        this.haveLength(cb);
      }
      /**
       * Payload length has been read.
       *
       * @param {Function} cb Callback
       * @private
       */
      haveLength(cb) {
        if (this._payloadLength && this._opcode < 8) {
          this._totalPayloadLength += this._payloadLength;
          if (this._totalPayloadLength > this._maxPayload && this._maxPayload > 0) {
            const error = this.createError(
              RangeError,
              "Max payload size exceeded",
              false,
              1009,
              "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
            );
            cb(error);
            return;
          }
        }
        if (this._masked) this._state = GET_MASK;
        else this._state = GET_DATA;
      }
      /**
       * Reads mask bytes.
       *
       * @private
       */
      getMask() {
        if (this._bufferedBytes < 4) {
          this._loop = false;
          return;
        }
        this._mask = this.consume(4);
        this._state = GET_DATA;
      }
      /**
       * Reads data bytes.
       *
       * @param {Function} cb Callback
       * @private
       */
      getData(cb) {
        let data = EMPTY_BUFFER;
        if (this._payloadLength) {
          if (this._bufferedBytes < this._payloadLength) {
            this._loop = false;
            return;
          }
          data = this.consume(this._payloadLength);
          if (this._masked && (this._mask[0] | this._mask[1] | this._mask[2] | this._mask[3]) !== 0) {
            unmask(data, this._mask);
          }
        }
        if (this._opcode > 7) {
          this.controlMessage(data, cb);
          return;
        }
        if (this._compressed) {
          this._state = INFLATING;
          this.decompress(data, cb);
          return;
        }
        if (data.length) {
          if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
            const error = this.createError(
              RangeError,
              "Too many message fragments",
              false,
              1008,
              "WS_ERR_TOO_MANY_BUFFERED_PARTS"
            );
            cb(error);
            return;
          }
          this._messageLength = this._totalPayloadLength;
          this._fragments.push(data);
        }
        this.dataMessage(cb);
      }
      /**
       * Decompresses data.
       *
       * @param {Buffer} data Compressed data
       * @param {Function} cb Callback
       * @private
       */
      decompress(data, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        perMessageDeflate.decompress(data, this._fin, (err, buf) => {
          if (err) return cb(err);
          if (buf.length) {
            this._messageLength += buf.length;
            if (this._messageLength > this._maxPayload && this._maxPayload > 0) {
              const error = this.createError(
                RangeError,
                "Max payload size exceeded",
                false,
                1009,
                "WS_ERR_UNSUPPORTED_MESSAGE_LENGTH"
              );
              cb(error);
              return;
            }
            if (this._maxFragments > 0 && this._fragments.length >= this._maxFragments) {
              const error = this.createError(
                RangeError,
                "Too many message fragments",
                false,
                1008,
                "WS_ERR_TOO_MANY_BUFFERED_PARTS"
              );
              cb(error);
              return;
            }
            this._fragments.push(buf);
          }
          this.dataMessage(cb);
          if (this._state === GET_INFO) this.startLoop(cb);
        });
      }
      /**
       * Handles a data message.
       *
       * @param {Function} cb Callback
       * @private
       */
      dataMessage(cb) {
        if (!this._fin) {
          this._state = GET_INFO;
          return;
        }
        const messageLength = this._messageLength;
        const fragments = this._fragments;
        this._totalPayloadLength = 0;
        this._messageLength = 0;
        this._fragmented = 0;
        this._fragments = [];
        if (this._opcode === 2) {
          let data;
          if (this._binaryType === "nodebuffer") {
            data = concat(fragments, messageLength);
          } else if (this._binaryType === "arraybuffer") {
            data = toArrayBuffer(concat(fragments, messageLength));
          } else if (this._binaryType === "blob") {
            data = new Blob(fragments);
          } else {
            data = fragments;
          }
          if (this._allowSynchronousEvents) {
            this.emit("message", data, true);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", data, true);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        } else {
          const buf = concat(fragments, messageLength);
          if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
            const error = this.createError(
              Error,
              "invalid UTF-8 sequence",
              true,
              1007,
              "WS_ERR_INVALID_UTF8"
            );
            cb(error);
            return;
          }
          if (this._state === INFLATING || this._allowSynchronousEvents) {
            this.emit("message", buf, false);
            this._state = GET_INFO;
          } else {
            this._state = DEFER_EVENT;
            setImmediate(() => {
              this.emit("message", buf, false);
              this._state = GET_INFO;
              this.startLoop(cb);
            });
          }
        }
      }
      /**
       * Handles a control message.
       *
       * @param {Buffer} data Data to handle
       * @return {(Error|RangeError|undefined)} A possible error
       * @private
       */
      controlMessage(data, cb) {
        if (this._opcode === 8) {
          if (data.length === 0) {
            this._loop = false;
            this.emit("conclude", 1005, EMPTY_BUFFER);
            this.end();
          } else {
            const code2 = data.readUInt16BE(0);
            if (!isValidStatusCode(code2)) {
              const error = this.createError(
                RangeError,
                `invalid status code ${code2}`,
                true,
                1002,
                "WS_ERR_INVALID_CLOSE_CODE"
              );
              cb(error);
              return;
            }
            const buf = new FastBuffer(
              data.buffer,
              data.byteOffset + 2,
              data.length - 2
            );
            if (!this._skipUTF8Validation && !isValidUTF8(buf)) {
              const error = this.createError(
                Error,
                "invalid UTF-8 sequence",
                true,
                1007,
                "WS_ERR_INVALID_UTF8"
              );
              cb(error);
              return;
            }
            this._loop = false;
            this.emit("conclude", code2, buf);
            this.end();
          }
          this._state = GET_INFO;
          return;
        }
        if (this._allowSynchronousEvents) {
          this.emit(this._opcode === 9 ? "ping" : "pong", data);
          this._state = GET_INFO;
        } else {
          this._state = DEFER_EVENT;
          setImmediate(() => {
            this.emit(this._opcode === 9 ? "ping" : "pong", data);
            this._state = GET_INFO;
            this.startLoop(cb);
          });
        }
      }
      /**
       * Builds an error object.
       *
       * @param {function(new:Error|RangeError)} ErrorCtor The error constructor
       * @param {String} message The error message
       * @param {Boolean} prefix Specifies whether or not to add a default prefix to
       *     `message`
       * @param {Number} statusCode The status code
       * @param {String} errorCode The exposed error code
       * @return {(Error|RangeError)} The error
       * @private
       */
      createError(ErrorCtor, message, prefix, statusCode, errorCode) {
        this._loop = false;
        this._errored = true;
        const err = new ErrorCtor(
          prefix ? `Invalid WebSocket frame: ${message}` : message
        );
        Error.captureStackTrace(err, this.createError);
        err.code = errorCode;
        err[kStatusCode] = statusCode;
        return err;
      }
    };
    module.exports = Receiver2;
  }
});
var require_sender = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/sender.js"(exports, module) {
    "use strict";
    var { Duplex } = __require("stream");
    var { randomFillSync } = __require("crypto");
    var {
      types: { isUint8Array }
    } = __require("util");
    var PerMessageDeflate2 = require_permessage_deflate();
    var { EMPTY_BUFFER, kWebSocket, NOOP } = require_constants();
    var { isBlob, isValidStatusCode } = require_validation();
    var { mask: applyMask, toBuffer } = require_buffer_util();
    var kByteLength = Symbol("kByteLength");
    var maskBuffer = Buffer.alloc(4);
    var RANDOM_POOL_SIZE = 8 * 1024;
    var randomPool;
    var randomPoolPointer = RANDOM_POOL_SIZE;
    var DEFAULT = 0;
    var DEFLATING = 1;
    var GET_BLOB_DATA = 2;
    var Sender2 = class _Sender {
      /**
       * Creates a Sender instance.
       *
       * @param {Duplex} socket The connection socket
       * @param {Object} [extensions] An object containing the negotiated extensions
       * @param {Function} [generateMask] The function used to generate the masking
       *     key
       */
      constructor(socket, extensions, generateMask) {
        this._extensions = extensions || {};
        if (generateMask) {
          this._generateMask = generateMask;
          this._maskBuffer = Buffer.alloc(4);
        }
        this._socket = socket;
        this._firstFragment = true;
        this._compress = false;
        this._bufferedBytes = 0;
        this._queue = [];
        this._state = DEFAULT;
        this.onerror = NOOP;
        this[kWebSocket] = void 0;
      }
      /**
       * Frames a piece of data according to the HyBi WebSocket protocol.
       *
       * @param {(Buffer|String)} data The data to frame
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @return {(Buffer|String)[]} The framed data
       * @public
       */
      static frame(data, options) {
        let mask;
        let merge = false;
        let offset = 2;
        let skipMasking = false;
        if (options.mask) {
          mask = options.maskBuffer || maskBuffer;
          if (options.generateMask) {
            options.generateMask(mask);
          } else {
            if (randomPoolPointer === RANDOM_POOL_SIZE) {
              if (randomPool === void 0) {
                randomPool = Buffer.alloc(RANDOM_POOL_SIZE);
              }
              randomFillSync(randomPool, 0, RANDOM_POOL_SIZE);
              randomPoolPointer = 0;
            }
            mask[0] = randomPool[randomPoolPointer++];
            mask[1] = randomPool[randomPoolPointer++];
            mask[2] = randomPool[randomPoolPointer++];
            mask[3] = randomPool[randomPoolPointer++];
          }
          skipMasking = (mask[0] | mask[1] | mask[2] | mask[3]) === 0;
          offset = 6;
        }
        let dataLength;
        if (typeof data === "string") {
          if ((!options.mask || skipMasking) && options[kByteLength] !== void 0) {
            dataLength = options[kByteLength];
          } else {
            data = Buffer.from(data);
            dataLength = data.length;
          }
        } else {
          dataLength = data.length;
          merge = options.mask && options.readOnly && !skipMasking;
        }
        let payloadLength = dataLength;
        if (dataLength >= 65536) {
          offset += 8;
          payloadLength = 127;
        } else if (dataLength > 125) {
          offset += 2;
          payloadLength = 126;
        }
        const target = Buffer.allocUnsafe(merge ? dataLength + offset : offset);
        target[0] = options.fin ? options.opcode | 128 : options.opcode;
        if (options.rsv1) target[0] |= 64;
        target[1] = payloadLength;
        if (payloadLength === 126) {
          target.writeUInt16BE(dataLength, 2);
        } else if (payloadLength === 127) {
          target[2] = target[3] = 0;
          target.writeUIntBE(dataLength, 4, 6);
        }
        if (!options.mask) return [target, data];
        target[1] |= 128;
        target[offset - 4] = mask[0];
        target[offset - 3] = mask[1];
        target[offset - 2] = mask[2];
        target[offset - 1] = mask[3];
        if (skipMasking) return [target, data];
        if (merge) {
          applyMask(data, mask, target, offset, dataLength);
          return [target];
        }
        applyMask(data, mask, data, 0, dataLength);
        return [target, data];
      }
      /**
       * Sends a close message to the other peer.
       *
       * @param {Number} [code] The status code component of the body
       * @param {(String|Buffer)} [data] The message component of the body
       * @param {Boolean} [mask=false] Specifies whether or not to mask the message
       * @param {Function} [cb] Callback
       * @public
       */
      close(code2, data, mask, cb) {
        let buf;
        if (code2 === void 0) {
          buf = EMPTY_BUFFER;
        } else if (typeof code2 !== "number" || !isValidStatusCode(code2)) {
          throw new TypeError("First argument must be a valid error code number");
        } else if (data === void 0 || !data.length) {
          buf = Buffer.allocUnsafe(2);
          buf.writeUInt16BE(code2, 0);
        } else {
          const length = Buffer.byteLength(data);
          if (length > 123) {
            throw new RangeError("The message must not be greater than 123 bytes");
          }
          buf = Buffer.allocUnsafe(2 + length);
          buf.writeUInt16BE(code2, 0);
          if (typeof data === "string") {
            buf.write(data, 2);
          } else if (isUint8Array(data)) {
            buf.set(data, 2);
          } else {
            throw new TypeError("Second argument must be a string or a Uint8Array");
          }
        }
        const options = {
          [kByteLength]: buf.length,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 8,
          readOnly: false,
          rsv1: false
        };
        if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, buf, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(buf, options), cb);
        }
      }
      /**
       * Sends a ping message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      ping(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 9,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a pong message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Boolean} [mask=false] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback
       * @public
       */
      pong(data, mask, cb) {
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (byteLength > 125) {
          throw new RangeError("The data size must not be greater than 125 bytes");
        }
        const options = {
          [kByteLength]: byteLength,
          fin: true,
          generateMask: this._generateMask,
          mask,
          maskBuffer: this._maskBuffer,
          opcode: 10,
          readOnly,
          rsv1: false
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, false, options, cb]);
          } else {
            this.getBlobData(data, false, options, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, false, options, cb]);
        } else {
          this.sendFrame(_Sender.frame(data, options), cb);
        }
      }
      /**
       * Sends a data message to the other peer.
       *
       * @param {*} data The message to send
       * @param {Object} options Options object
       * @param {Boolean} [options.binary=false] Specifies whether `data` is binary
       *     or text
       * @param {Boolean} [options.compress=false] Specifies whether or not to
       *     compress `data`
       * @param {Boolean} [options.fin=false] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Function} [cb] Callback
       * @public
       */
      send(data, options, cb) {
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        let opcode = options.binary ? 2 : 1;
        let rsv1 = options.compress;
        let byteLength;
        let readOnly;
        if (typeof data === "string") {
          byteLength = Buffer.byteLength(data);
          readOnly = false;
        } else if (isBlob(data)) {
          byteLength = data.size;
          readOnly = false;
        } else {
          data = toBuffer(data);
          byteLength = data.length;
          readOnly = toBuffer.readOnly;
        }
        if (this._firstFragment) {
          this._firstFragment = false;
          if (rsv1 && perMessageDeflate && perMessageDeflate.params[perMessageDeflate._isServer ? "server_no_context_takeover" : "client_no_context_takeover"]) {
            rsv1 = byteLength >= perMessageDeflate._threshold;
          }
          this._compress = rsv1;
        } else {
          rsv1 = false;
          opcode = 0;
        }
        if (options.fin) this._firstFragment = true;
        const opts = {
          [kByteLength]: byteLength,
          fin: options.fin,
          generateMask: this._generateMask,
          mask: options.mask,
          maskBuffer: this._maskBuffer,
          opcode,
          readOnly,
          rsv1
        };
        if (isBlob(data)) {
          if (this._state !== DEFAULT) {
            this.enqueue([this.getBlobData, data, this._compress, opts, cb]);
          } else {
            this.getBlobData(data, this._compress, opts, cb);
          }
        } else if (this._state !== DEFAULT) {
          this.enqueue([this.dispatch, data, this._compress, opts, cb]);
        } else {
          this.dispatch(data, this._compress, opts, cb);
        }
      }
      /**
       * Gets the contents of a blob as binary data.
       *
       * @param {Blob} blob The blob
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     the data
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      getBlobData(blob, compress, options, cb) {
        this._bufferedBytes += options[kByteLength];
        this._state = GET_BLOB_DATA;
        blob.arrayBuffer().then((arrayBuffer) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while the blob was being read"
            );
            process.nextTick(callCallbacks, this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          const data = toBuffer(arrayBuffer);
          if (!compress) {
            this._state = DEFAULT;
            this.sendFrame(_Sender.frame(data, options), cb);
            this.dequeue();
          } else {
            this.dispatch(data, compress, options, cb);
          }
        }).catch((err) => {
          process.nextTick(onError, this, err, cb);
        });
      }
      /**
       * Dispatches a message.
       *
       * @param {(Buffer|String)} data The message to send
       * @param {Boolean} [compress=false] Specifies whether or not to compress
       *     `data`
       * @param {Object} options Options object
       * @param {Boolean} [options.fin=false] Specifies whether or not to set the
       *     FIN bit
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Boolean} [options.mask=false] Specifies whether or not to mask
       *     `data`
       * @param {Buffer} [options.maskBuffer] The buffer used to store the masking
       *     key
       * @param {Number} options.opcode The opcode
       * @param {Boolean} [options.readOnly=false] Specifies whether `data` can be
       *     modified
       * @param {Boolean} [options.rsv1=false] Specifies whether or not to set the
       *     RSV1 bit
       * @param {Function} [cb] Callback
       * @private
       */
      dispatch(data, compress, options, cb) {
        if (!compress) {
          this.sendFrame(_Sender.frame(data, options), cb);
          return;
        }
        const perMessageDeflate = this._extensions[PerMessageDeflate2.extensionName];
        this._bufferedBytes += options[kByteLength];
        this._state = DEFLATING;
        perMessageDeflate.compress(data, options.fin, (_, buf) => {
          if (this._socket.destroyed) {
            const err = new Error(
              "The socket was closed while data was being compressed"
            );
            callCallbacks(this, err, cb);
            return;
          }
          this._bufferedBytes -= options[kByteLength];
          this._state = DEFAULT;
          options.readOnly = false;
          this.sendFrame(_Sender.frame(buf, options), cb);
          this.dequeue();
        });
      }
      /**
       * Executes queued send operations.
       *
       * @private
       */
      dequeue() {
        while (this._state === DEFAULT && this._queue.length) {
          const params = this._queue.shift();
          this._bufferedBytes -= params[3][kByteLength];
          Reflect.apply(params[0], this, params.slice(1));
        }
      }
      /**
       * Enqueues a send operation.
       *
       * @param {Array} params Send operation parameters.
       * @private
       */
      enqueue(params) {
        this._bufferedBytes += params[3][kByteLength];
        this._queue.push(params);
      }
      /**
       * Sends a frame.
       *
       * @param {(Buffer | String)[]} list The frame to send
       * @param {Function} [cb] Callback
       * @private
       */
      sendFrame(list, cb) {
        if (list.length === 2) {
          this._socket.cork();
          this._socket.write(list[0]);
          this._socket.write(list[1], cb);
          this._socket.uncork();
        } else {
          this._socket.write(list[0], cb);
        }
      }
    };
    module.exports = Sender2;
    function callCallbacks(sender, err, cb) {
      if (typeof cb === "function") cb(err);
      for (let i = 0; i < sender._queue.length; i++) {
        const params = sender._queue[i];
        const callback = params[params.length - 1];
        if (typeof callback === "function") callback(err);
      }
    }
    function onError(sender, err, cb) {
      callCallbacks(sender, err, cb);
      sender.onerror(err);
    }
  }
});
var require_event_target = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/event-target.js"(exports, module) {
    "use strict";
    var { kForOnEventAttribute, kListener } = require_constants();
    var kCode = Symbol("kCode");
    var kData = Symbol("kData");
    var kError = Symbol("kError");
    var kMessage = Symbol("kMessage");
    var kReason = Symbol("kReason");
    var kTarget = Symbol("kTarget");
    var kType = Symbol("kType");
    var kWasClean = Symbol("kWasClean");
    var Event = class {
      /**
       * Create a new `Event`.
       *
       * @param {String} type The name of the event
       * @throws {TypeError} If the `type` argument is not specified
       */
      constructor(type) {
        this[kTarget] = null;
        this[kType] = type;
      }
      /**
       * @type {*}
       */
      get target() {
        return this[kTarget];
      }
      /**
       * @type {String}
       */
      get type() {
        return this[kType];
      }
    };
    Object.defineProperty(Event.prototype, "target", { enumerable: true });
    Object.defineProperty(Event.prototype, "type", { enumerable: true });
    var CloseEvent = class extends Event {
      /**
       * Create a new `CloseEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {Number} [options.code=0] The status code explaining why the
       *     connection was closed
       * @param {String} [options.reason=''] A human-readable string explaining why
       *     the connection was closed
       * @param {Boolean} [options.wasClean=false] Indicates whether or not the
       *     connection was cleanly closed
       */
      constructor(type, options = {}) {
        super(type);
        this[kCode] = options.code === void 0 ? 0 : options.code;
        this[kReason] = options.reason === void 0 ? "" : options.reason;
        this[kWasClean] = options.wasClean === void 0 ? false : options.wasClean;
      }
      /**
       * @type {Number}
       */
      get code() {
        return this[kCode];
      }
      /**
       * @type {String}
       */
      get reason() {
        return this[kReason];
      }
      /**
       * @type {Boolean}
       */
      get wasClean() {
        return this[kWasClean];
      }
    };
    Object.defineProperty(CloseEvent.prototype, "code", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "reason", { enumerable: true });
    Object.defineProperty(CloseEvent.prototype, "wasClean", { enumerable: true });
    var ErrorEvent = class extends Event {
      /**
       * Create a new `ErrorEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.error=null] The error that generated this event
       * @param {String} [options.message=''] The error message
       */
      constructor(type, options = {}) {
        super(type);
        this[kError] = options.error === void 0 ? null : options.error;
        this[kMessage] = options.message === void 0 ? "" : options.message;
      }
      /**
       * @type {*}
       */
      get error() {
        return this[kError];
      }
      /**
       * @type {String}
       */
      get message() {
        return this[kMessage];
      }
    };
    Object.defineProperty(ErrorEvent.prototype, "error", { enumerable: true });
    Object.defineProperty(ErrorEvent.prototype, "message", { enumerable: true });
    var MessageEvent = class extends Event {
      /**
       * Create a new `MessageEvent`.
       *
       * @param {String} type The name of the event
       * @param {Object} [options] A dictionary object that allows for setting
       *     attributes via object members of the same name
       * @param {*} [options.data=null] The message content
       */
      constructor(type, options = {}) {
        super(type);
        this[kData] = options.data === void 0 ? null : options.data;
      }
      /**
       * @type {*}
       */
      get data() {
        return this[kData];
      }
    };
    Object.defineProperty(MessageEvent.prototype, "data", { enumerable: true });
    var EventTarget = {
      /**
       * Register an event listener.
       *
       * @param {String} type A string representing the event type to listen for
       * @param {(Function|Object)} handler The listener to add
       * @param {Object} [options] An options object specifies characteristics about
       *     the event listener
       * @param {Boolean} [options.once=false] A `Boolean` indicating that the
       *     listener should be invoked at most once after being added. If `true`,
       *     the listener would be automatically removed when invoked.
       * @public
       */
      addEventListener(type, handler2, options = {}) {
        for (const listener of this.listeners(type)) {
          if (!options[kForOnEventAttribute] && listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            return;
          }
        }
        let wrapper;
        if (type === "message") {
          wrapper = function onMessage(data, isBinary) {
            const event = new MessageEvent("message", {
              data: isBinary ? data : data.toString()
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "close") {
          wrapper = function onClose(code2, message) {
            const event = new CloseEvent("close", {
              code: code2,
              reason: message.toString(),
              wasClean: this._closeFrameReceived && this._closeFrameSent
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "error") {
          wrapper = function onError(error) {
            const event = new ErrorEvent("error", {
              error,
              message: error.message
            });
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else if (type === "open") {
          wrapper = function onOpen() {
            const event = new Event("open");
            event[kTarget] = this;
            callListener(handler2, this, event);
          };
        } else {
          return;
        }
        wrapper[kForOnEventAttribute] = !!options[kForOnEventAttribute];
        wrapper[kListener] = handler2;
        if (options.once) {
          this.once(type, wrapper);
        } else {
          this.on(type, wrapper);
        }
      },
      /**
       * Remove an event listener.
       *
       * @param {String} type A string representing the event type to remove
       * @param {(Function|Object)} handler The listener to remove
       * @public
       */
      removeEventListener(type, handler2) {
        for (const listener of this.listeners(type)) {
          if (listener[kListener] === handler2 && !listener[kForOnEventAttribute]) {
            this.removeListener(type, listener);
            break;
          }
        }
      }
    };
    module.exports = {
      CloseEvent,
      ErrorEvent,
      Event,
      EventTarget,
      MessageEvent
    };
    function callListener(listener, thisArg, event) {
      if (typeof listener === "object" && listener.handleEvent) {
        listener.handleEvent.call(listener, event);
      } else {
        listener.call(thisArg, event);
      }
    }
  }
});
var require_extension = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/extension.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function push(dest, name, elem) {
      if (dest[name] === void 0) dest[name] = [elem];
      else dest[name].push(elem);
    }
    function parse(header) {
      const offers = /* @__PURE__ */ Object.create(null);
      let params = /* @__PURE__ */ Object.create(null);
      let mustUnescape = false;
      let isEscaping = false;
      let inQuotes = false;
      let extensionName;
      let paramName;
      let start = -1;
      let code2 = -1;
      let end = -1;
      let i = 0;
      for (; i < header.length; i++) {
        code2 = header.charCodeAt(i);
        if (extensionName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            const name = header.slice(start, end);
            if (code2 === 44) {
              push(offers, name, params);
              params = /* @__PURE__ */ Object.create(null);
            } else {
              extensionName = name;
            }
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else if (paramName === void 0) {
          if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (code2 === 32 || code2 === 9) {
            if (end === -1 && start !== -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            push(params, header.slice(start, end), true);
            if (code2 === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            start = end = -1;
          } else if (code2 === 61 && start !== -1 && end === -1) {
            paramName = header.slice(start, i);
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        } else {
          if (isEscaping) {
            if (tokenChars[code2] !== 1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (start === -1) start = i;
            else if (!mustUnescape) mustUnescape = true;
            isEscaping = false;
          } else if (inQuotes) {
            if (tokenChars[code2] === 1) {
              if (start === -1) start = i;
            } else if (code2 === 34 && start !== -1) {
              inQuotes = false;
              end = i;
            } else if (code2 === 92) {
              isEscaping = true;
            } else {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
          } else if (code2 === 34 && header.charCodeAt(i - 1) === 61) {
            inQuotes = true;
          } else if (end === -1 && tokenChars[code2] === 1) {
            if (start === -1) start = i;
          } else if (start !== -1 && (code2 === 32 || code2 === 9)) {
            if (end === -1) end = i;
          } else if (code2 === 59 || code2 === 44) {
            if (start === -1) {
              throw new SyntaxError(`Unexpected character at index ${i}`);
            }
            if (end === -1) end = i;
            let value = header.slice(start, end);
            if (mustUnescape) {
              value = value.replace(/\\/g, "");
              mustUnescape = false;
            }
            push(params, paramName, value);
            if (code2 === 44) {
              push(offers, extensionName, params);
              params = /* @__PURE__ */ Object.create(null);
              extensionName = void 0;
            }
            paramName = void 0;
            start = end = -1;
          } else {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
        }
      }
      if (start === -1 || inQuotes || code2 === 32 || code2 === 9) {
        throw new SyntaxError("Unexpected end of input");
      }
      if (end === -1) end = i;
      const token = header.slice(start, end);
      if (extensionName === void 0) {
        push(offers, token, params);
      } else {
        if (paramName === void 0) {
          push(params, token, true);
        } else if (mustUnescape) {
          push(params, paramName, token.replace(/\\/g, ""));
        } else {
          push(params, paramName, token);
        }
        push(offers, extensionName, params);
      }
      return offers;
    }
    function format(extensions) {
      return Object.keys(extensions).map((extension2) => {
        let configurations = extensions[extension2];
        if (!Array.isArray(configurations)) configurations = [configurations];
        return configurations.map((params) => {
          return [extension2].concat(
            Object.keys(params).map((k) => {
              let values = params[k];
              if (!Array.isArray(values)) values = [values];
              return values.map((v2) => v2 === true ? k : `${k}=${v2}`).join("; ");
            })
          ).join("; ");
        }).join(", ");
      }).join(", ");
    }
    module.exports = { format, parse };
  }
});
var require_websocket = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/websocket.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var https = __require("https");
    var http = __require("http");
    var net = __require("net");
    var tls = __require("tls");
    var { randomBytes, createHash } = __require("crypto");
    var { Duplex, Readable } = __require("stream");
    var { URL: URL2 } = __require("url");
    var PerMessageDeflate2 = require_permessage_deflate();
    var Receiver2 = require_receiver();
    var Sender2 = require_sender();
    var { isBlob } = require_validation();
    var {
      BINARY_TYPES,
      CLOSE_TIMEOUT,
      EMPTY_BUFFER,
      GUID,
      kForOnEventAttribute,
      kListener,
      kStatusCode,
      kWebSocket,
      NOOP
    } = require_constants();
    var {
      EventTarget: { addEventListener, removeEventListener }
    } = require_event_target();
    var { format, parse } = require_extension();
    var { toBuffer } = require_buffer_util();
    var kAborted = Symbol("kAborted");
    var protocolVersions = [8, 13];
    var readyStates = ["CONNECTING", "OPEN", "CLOSING", "CLOSED"];
    var subprotocolRegex = /^[!#$%&'*+\-.0-9A-Z^_`|a-z~]+$/;
    var WebSocket2 = class _WebSocket extends EventEmitter {
      /**
       * Create a new `WebSocket`.
       *
       * @param {(String|URL)} address The URL to which to connect
       * @param {(String|String[])} [protocols] The subprotocols
       * @param {Object} [options] Connection options
       */
      constructor(address, protocols, options) {
        super();
        this._binaryType = BINARY_TYPES[0];
        this._closeCode = 1006;
        this._closeFrameReceived = false;
        this._closeFrameSent = false;
        this._closeMessage = EMPTY_BUFFER;
        this._closeTimer = null;
        this._errorEmitted = false;
        this._extensions = {};
        this._paused = false;
        this._protocol = "";
        this._readyState = _WebSocket.CONNECTING;
        this._receiver = null;
        this._sender = null;
        this._socket = null;
        if (address !== null) {
          this._bufferedAmount = 0;
          this._isServer = false;
          this._redirects = 0;
          if (protocols === void 0) {
            protocols = [];
          } else if (!Array.isArray(protocols)) {
            if (typeof protocols === "object" && protocols !== null) {
              options = protocols;
              protocols = [];
            } else {
              protocols = [protocols];
            }
          }
          initAsClient(this, address, protocols, options);
        } else {
          this._autoPong = options.autoPong;
          this._closeTimeout = options.closeTimeout;
          this._isServer = true;
        }
      }
      /**
       * For historical reasons, the custom "nodebuffer" type is used by the default
       * instead of "blob".
       *
       * @type {String}
       */
      get binaryType() {
        return this._binaryType;
      }
      set binaryType(type) {
        if (!BINARY_TYPES.includes(type)) return;
        this._binaryType = type;
        if (this._receiver) this._receiver._binaryType = type;
      }
      /**
       * @type {Number}
       */
      get bufferedAmount() {
        if (!this._socket) return this._bufferedAmount;
        return this._socket._writableState.length + this._sender._bufferedBytes;
      }
      /**
       * @type {String}
       */
      get extensions() {
        return Object.keys(this._extensions).join();
      }
      /**
       * @type {Boolean}
       */
      get isPaused() {
        return this._paused;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onclose() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onerror() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onopen() {
        return null;
      }
      /**
       * @type {Function}
       */
      /* istanbul ignore next */
      get onmessage() {
        return null;
      }
      /**
       * @type {String}
       */
      get protocol() {
        return this._protocol;
      }
      /**
       * @type {Number}
       */
      get readyState() {
        return this._readyState;
      }
      /**
       * @type {String}
       */
      get url() {
        return this._url;
      }
      /**
       * Set up the socket and the internal resources.
       *
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Object} options Options object
       * @param {Boolean} [options.allowSynchronousEvents=false] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Function} [options.generateMask] The function used to generate the
       *     masking key
       * @param {Number} [options.maxBufferedChunks=0] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=0] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=0] The maximum allowed message size
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @private
       */
      setSocket(socket, head, options) {
        const receiver = new Receiver2({
          allowSynchronousEvents: options.allowSynchronousEvents,
          binaryType: this.binaryType,
          extensions: this._extensions,
          isServer: this._isServer,
          maxBufferedChunks: options.maxBufferedChunks,
          maxFragments: options.maxFragments,
          maxPayload: options.maxPayload,
          skipUTF8Validation: options.skipUTF8Validation
        });
        const sender = new Sender2(socket, this._extensions, options.generateMask);
        this._receiver = receiver;
        this._sender = sender;
        this._socket = socket;
        receiver[kWebSocket] = this;
        sender[kWebSocket] = this;
        socket[kWebSocket] = this;
        receiver.on("conclude", receiverOnConclude);
        receiver.on("drain", receiverOnDrain);
        receiver.on("error", receiverOnError);
        receiver.on("message", receiverOnMessage);
        receiver.on("ping", receiverOnPing);
        receiver.on("pong", receiverOnPong);
        sender.onerror = senderOnError;
        if (socket.setTimeout) socket.setTimeout(0);
        if (socket.setNoDelay) socket.setNoDelay();
        if (head.length > 0) socket.unshift(head);
        socket.on("close", socketOnClose);
        socket.on("data", socketOnData);
        socket.on("end", socketOnEnd);
        socket.on("error", socketOnError);
        this._readyState = _WebSocket.OPEN;
        this.emit("open");
      }
      /**
       * Emit the `'close'` event.
       *
       * @private
       */
      emitClose() {
        if (!this._socket) {
          this._readyState = _WebSocket.CLOSED;
          this.emit("close", this._closeCode, this._closeMessage);
          return;
        }
        if (this._extensions[PerMessageDeflate2.extensionName]) {
          this._extensions[PerMessageDeflate2.extensionName].cleanup();
        }
        this._receiver.removeAllListeners();
        this._readyState = _WebSocket.CLOSED;
        this.emit("close", this._closeCode, this._closeMessage);
      }
      /**
       * Start a closing handshake.
       *
       *          +----------+   +-----------+   +----------+
       *     - - -|ws.close()|-->|close frame|-->|ws.close()|- - -
       *    |     +----------+   +-----------+   +----------+     |
       *          +----------+   +-----------+         |
       * CLOSING  |ws.close()|<--|close frame|<--+-----+       CLOSING
       *          +----------+   +-----------+   |
       *    |           |                        |   +---+        |
       *                +------------------------+-->|fin| - - - -
       *    |         +---+                      |   +---+
       *     - - - - -|fin|<---------------------+
       *              +---+
       *
       * @param {Number} [code] Status code explaining why the connection is closing
       * @param {(String|Buffer)} [data] The reason why the connection is
       *     closing
       * @public
       */
      close(code2, data) {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this.readyState === _WebSocket.CLOSING) {
          if (this._closeFrameSent && (this._closeFrameReceived || this._receiver._writableState.errorEmitted)) {
            this._socket.end();
          }
          return;
        }
        this._readyState = _WebSocket.CLOSING;
        this._sender.close(code2, data, !this._isServer, (err) => {
          if (err) return;
          this._closeFrameSent = true;
          if (this._closeFrameReceived || this._receiver._writableState.errorEmitted) {
            this._socket.end();
          }
        });
        setCloseTimer(this);
      }
      /**
       * Pause the socket.
       *
       * @public
       */
      pause() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = true;
        this._socket.pause();
      }
      /**
       * Send a ping.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the ping is sent
       * @public
       */
      ping(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.ping(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Send a pong.
       *
       * @param {*} [data] The data to send
       * @param {Boolean} [mask] Indicates whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when the pong is sent
       * @public
       */
      pong(data, mask, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof data === "function") {
          cb = data;
          data = mask = void 0;
        } else if (typeof mask === "function") {
          cb = mask;
          mask = void 0;
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        if (mask === void 0) mask = !this._isServer;
        this._sender.pong(data || EMPTY_BUFFER, mask, cb);
      }
      /**
       * Resume the socket.
       *
       * @public
       */
      resume() {
        if (this.readyState === _WebSocket.CONNECTING || this.readyState === _WebSocket.CLOSED) {
          return;
        }
        this._paused = false;
        if (!this._receiver._writableState.needDrain) this._socket.resume();
      }
      /**
       * Send a data message.
       *
       * @param {*} data The message to send
       * @param {Object} [options] Options object
       * @param {Boolean} [options.binary] Specifies whether `data` is binary or
       *     text
       * @param {Boolean} [options.compress] Specifies whether or not to compress
       *     `data`
       * @param {Boolean} [options.fin=true] Specifies whether the fragment is the
       *     last one
       * @param {Boolean} [options.mask] Specifies whether or not to mask `data`
       * @param {Function} [cb] Callback which is executed when data is written out
       * @public
       */
      send(data, options, cb) {
        if (this.readyState === _WebSocket.CONNECTING) {
          throw new Error("WebSocket is not open: readyState 0 (CONNECTING)");
        }
        if (typeof options === "function") {
          cb = options;
          options = {};
        }
        if (typeof data === "number") data = data.toString();
        if (this.readyState !== _WebSocket.OPEN) {
          sendAfterClose(this, data, cb);
          return;
        }
        const opts = {
          binary: typeof data !== "string",
          mask: !this._isServer,
          compress: true,
          fin: true,
          ...options
        };
        if (!this._extensions[PerMessageDeflate2.extensionName]) {
          opts.compress = false;
        }
        this._sender.send(data || EMPTY_BUFFER, opts, cb);
      }
      /**
       * Forcibly close the connection.
       *
       * @public
       */
      terminate() {
        if (this.readyState === _WebSocket.CLOSED) return;
        if (this.readyState === _WebSocket.CONNECTING) {
          const msg = "WebSocket was closed before the connection was established";
          abortHandshake(this, this._req, msg);
          return;
        }
        if (this._socket) {
          this._readyState = _WebSocket.CLOSING;
          this._socket.destroy();
        }
      }
    };
    Object.defineProperty(WebSocket2, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2.prototype, "CONNECTING", {
      enumerable: true,
      value: readyStates.indexOf("CONNECTING")
    });
    Object.defineProperty(WebSocket2, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2.prototype, "OPEN", {
      enumerable: true,
      value: readyStates.indexOf("OPEN")
    });
    Object.defineProperty(WebSocket2, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSING", {
      enumerable: true,
      value: readyStates.indexOf("CLOSING")
    });
    Object.defineProperty(WebSocket2, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    Object.defineProperty(WebSocket2.prototype, "CLOSED", {
      enumerable: true,
      value: readyStates.indexOf("CLOSED")
    });
    [
      "binaryType",
      "bufferedAmount",
      "extensions",
      "isPaused",
      "protocol",
      "readyState",
      "url"
    ].forEach((property) => {
      Object.defineProperty(WebSocket2.prototype, property, { enumerable: true });
    });
    ["open", "error", "close", "message"].forEach((method) => {
      Object.defineProperty(WebSocket2.prototype, `on${method}`, {
        enumerable: true,
        get() {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) return listener[kListener];
          }
          return null;
        },
        set(handler2) {
          for (const listener of this.listeners(method)) {
            if (listener[kForOnEventAttribute]) {
              this.removeListener(method, listener);
              break;
            }
          }
          if (typeof handler2 !== "function") return;
          this.addEventListener(method, handler2, {
            [kForOnEventAttribute]: true
          });
        }
      });
    });
    WebSocket2.prototype.addEventListener = addEventListener;
    WebSocket2.prototype.removeEventListener = removeEventListener;
    module.exports = WebSocket2;
    function initAsClient(websocket, address, protocols, options) {
      const opts = {
        allowSynchronousEvents: true,
        autoPong: true,
        closeTimeout: CLOSE_TIMEOUT,
        protocolVersion: protocolVersions[1],
        maxBufferedChunks: 1024 * 1024,
        maxFragments: 128 * 1024,
        maxPayload: 100 * 1024 * 1024,
        skipUTF8Validation: false,
        perMessageDeflate: true,
        followRedirects: false,
        maxRedirects: 10,
        ...options,
        socketPath: void 0,
        hostname: void 0,
        protocol: void 0,
        timeout: void 0,
        method: "GET",
        host: void 0,
        path: void 0,
        port: void 0
      };
      websocket._autoPong = opts.autoPong;
      websocket._closeTimeout = opts.closeTimeout;
      if (!protocolVersions.includes(opts.protocolVersion)) {
        throw new RangeError(
          `Unsupported protocol version: ${opts.protocolVersion} (supported versions: ${protocolVersions.join(", ")})`
        );
      }
      let parsedUrl;
      if (address instanceof URL2) {
        parsedUrl = address;
      } else {
        try {
          parsedUrl = new URL2(address);
        } catch {
          throw new SyntaxError(`Invalid URL: ${address}`);
        }
      }
      if (parsedUrl.protocol === "http:") {
        parsedUrl.protocol = "ws:";
      } else if (parsedUrl.protocol === "https:") {
        parsedUrl.protocol = "wss:";
      }
      websocket._url = parsedUrl.href;
      const isSecure = parsedUrl.protocol === "wss:";
      const isIpcUrl = parsedUrl.protocol === "ws+unix:";
      let invalidUrlMessage;
      if (parsedUrl.protocol !== "ws:" && !isSecure && !isIpcUrl) {
        invalidUrlMessage = `The URL's protocol must be one of "ws:", "wss:", "http:", "https:", or "ws+unix:"`;
      } else if (isIpcUrl && !parsedUrl.pathname) {
        invalidUrlMessage = "The URL's pathname is empty";
      } else if (parsedUrl.hash) {
        invalidUrlMessage = "The URL contains a fragment identifier";
      }
      if (invalidUrlMessage) {
        const err = new SyntaxError(invalidUrlMessage);
        if (websocket._redirects === 0) {
          throw err;
        } else {
          emitErrorAndClose(websocket, err);
          return;
        }
      }
      const defaultPort = isSecure ? 443 : 80;
      const key = randomBytes(16).toString("base64");
      const request = isSecure ? https.request : http.request;
      const protocolSet = /* @__PURE__ */ new Set();
      let perMessageDeflate;
      opts.createConnection = opts.createConnection || (isSecure ? tlsConnect : netConnect);
      opts.defaultPort = opts.defaultPort || defaultPort;
      opts.port = parsedUrl.port || defaultPort;
      opts.host = parsedUrl.hostname.startsWith("[") ? parsedUrl.hostname.slice(1, -1) : parsedUrl.hostname;
      opts.headers = {
        ...opts.headers,
        "Sec-WebSocket-Version": opts.protocolVersion,
        "Sec-WebSocket-Key": key,
        Connection: "Upgrade",
        Upgrade: "websocket"
      };
      opts.path = parsedUrl.pathname + parsedUrl.search;
      opts.timeout = opts.handshakeTimeout;
      if (opts.perMessageDeflate) {
        perMessageDeflate = new PerMessageDeflate2({
          ...opts.perMessageDeflate,
          isServer: false,
          maxPayload: opts.maxPayload
        });
        opts.headers["Sec-WebSocket-Extensions"] = format({
          [PerMessageDeflate2.extensionName]: perMessageDeflate.offer()
        });
      }
      if (protocols.length) {
        for (const protocol of protocols) {
          if (typeof protocol !== "string" || !subprotocolRegex.test(protocol) || protocolSet.has(protocol)) {
            throw new SyntaxError(
              "An invalid or duplicated subprotocol was specified"
            );
          }
          protocolSet.add(protocol);
        }
        opts.headers["Sec-WebSocket-Protocol"] = protocols.join(",");
      }
      if (opts.origin) {
        if (opts.protocolVersion < 13) {
          opts.headers["Sec-WebSocket-Origin"] = opts.origin;
        } else {
          opts.headers.Origin = opts.origin;
        }
      }
      if (parsedUrl.username || parsedUrl.password) {
        opts.auth = `${parsedUrl.username}:${parsedUrl.password}`;
      }
      if (isIpcUrl) {
        const parts = opts.path.split(":");
        opts.socketPath = parts[0];
        opts.path = parts[1];
      }
      let req;
      if (opts.followRedirects) {
        if (websocket._redirects === 0) {
          websocket._originalIpc = isIpcUrl;
          websocket._originalSecure = isSecure;
          websocket._originalHostOrSocketPath = isIpcUrl ? opts.socketPath : parsedUrl.host;
          const headers = options && options.headers;
          options = { ...options, headers: {} };
          if (headers) {
            for (const [key2, value] of Object.entries(headers)) {
              options.headers[key2.toLowerCase()] = value;
            }
          }
        } else if (websocket.listenerCount("redirect") === 0) {
          const isSameHost = isIpcUrl ? websocket._originalIpc ? opts.socketPath === websocket._originalHostOrSocketPath : false : websocket._originalIpc ? false : parsedUrl.host === websocket._originalHostOrSocketPath;
          if (!isSameHost || websocket._originalSecure && !isSecure) {
            delete opts.headers.authorization;
            delete opts.headers.cookie;
            if (!isSameHost) delete opts.headers.host;
            opts.auth = void 0;
          }
        }
        if (opts.auth && !options.headers.authorization) {
          options.headers.authorization = "Basic " + Buffer.from(opts.auth).toString("base64");
        }
        req = websocket._req = request(opts);
        if (websocket._redirects) {
          websocket.emit("redirect", websocket.url, req);
        }
      } else {
        req = websocket._req = request(opts);
      }
      if (opts.timeout) {
        req.on("timeout", () => {
          abortHandshake(websocket, req, "Opening handshake has timed out");
        });
      }
      req.on("error", (err) => {
        if (req === null || req[kAborted]) return;
        req = websocket._req = null;
        emitErrorAndClose(websocket, err);
      });
      req.on("response", (res) => {
        const location = res.headers.location;
        const statusCode = res.statusCode;
        if (location && opts.followRedirects && statusCode >= 300 && statusCode < 400) {
          if (++websocket._redirects > opts.maxRedirects) {
            abortHandshake(websocket, req, "Maximum redirects exceeded");
            return;
          }
          req.abort();
          let addr;
          try {
            addr = new URL2(location, address);
          } catch (e) {
            const err = new SyntaxError(`Invalid URL: ${location}`);
            emitErrorAndClose(websocket, err);
            return;
          }
          initAsClient(websocket, addr, protocols, options);
        } else if (!websocket.emit("unexpected-response", req, res)) {
          abortHandshake(
            websocket,
            req,
            `Unexpected server response: ${res.statusCode}`
          );
        }
      });
      req.on("upgrade", (res, socket, head) => {
        websocket.emit("upgrade", res);
        if (websocket.readyState !== WebSocket2.CONNECTING) return;
        req = websocket._req = null;
        const upgrade = res.headers.upgrade;
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          abortHandshake(websocket, socket, "Invalid Upgrade header");
          return;
        }
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        if (res.headers["sec-websocket-accept"] !== digest) {
          abortHandshake(websocket, socket, "Invalid Sec-WebSocket-Accept header");
          return;
        }
        const serverProt = res.headers["sec-websocket-protocol"];
        let protError;
        if (serverProt !== void 0) {
          if (!protocolSet.size) {
            protError = "Server sent a subprotocol but none was requested";
          } else if (!protocolSet.has(serverProt)) {
            protError = "Server sent an invalid subprotocol";
          }
        } else if (protocolSet.size) {
          protError = "Server sent no subprotocol";
        }
        if (protError) {
          abortHandshake(websocket, socket, protError);
          return;
        }
        if (serverProt) websocket._protocol = serverProt;
        const secWebSocketExtensions = res.headers["sec-websocket-extensions"];
        if (secWebSocketExtensions !== void 0) {
          if (!perMessageDeflate) {
            const message = "Server sent a Sec-WebSocket-Extensions header but no extension was requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          let extensions;
          try {
            extensions = parse(secWebSocketExtensions);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          const extensionNames = Object.keys(extensions);
          if (extensionNames.length !== 1 || extensionNames[0] !== PerMessageDeflate2.extensionName) {
            const message = "Server indicated an extension that was not requested";
            abortHandshake(websocket, socket, message);
            return;
          }
          try {
            perMessageDeflate.accept(extensions[PerMessageDeflate2.extensionName]);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Extensions header";
            abortHandshake(websocket, socket, message);
            return;
          }
          websocket._extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
        }
        websocket.setSocket(socket, head, {
          allowSynchronousEvents: opts.allowSynchronousEvents,
          generateMask: opts.generateMask,
          maxBufferedChunks: opts.maxBufferedChunks,
          maxFragments: opts.maxFragments,
          maxPayload: opts.maxPayload,
          skipUTF8Validation: opts.skipUTF8Validation
        });
      });
      if (opts.finishRequest) {
        opts.finishRequest(req, websocket);
      } else {
        req.end();
      }
    }
    function emitErrorAndClose(websocket, err) {
      websocket._readyState = WebSocket2.CLOSING;
      websocket._errorEmitted = true;
      websocket.emit("error", err);
      websocket.emitClose();
    }
    function netConnect(options) {
      options.path = options.socketPath;
      return net.connect(options);
    }
    function tlsConnect(options) {
      options.path = void 0;
      if (!options.servername && options.servername !== "") {
        options.servername = net.isIP(options.host) ? "" : options.host;
      }
      return tls.connect(options);
    }
    function abortHandshake(websocket, stream, message) {
      websocket._readyState = WebSocket2.CLOSING;
      const err = new Error(message);
      Error.captureStackTrace(err, abortHandshake);
      if (stream.setHeader) {
        stream[kAborted] = true;
        stream.abort();
        if (stream.socket && !stream.socket.destroyed) {
          stream.socket.destroy();
        }
        process.nextTick(emitErrorAndClose, websocket, err);
      } else {
        stream.destroy(err);
        stream.once("error", websocket.emit.bind(websocket, "error"));
        stream.once("close", websocket.emitClose.bind(websocket));
      }
    }
    function sendAfterClose(websocket, data, cb) {
      if (data) {
        const length = isBlob(data) ? data.size : toBuffer(data).length;
        if (websocket._socket) websocket._sender._bufferedBytes += length;
        else websocket._bufferedAmount += length;
      }
      if (cb) {
        const err = new Error(
          `WebSocket is not open: readyState ${websocket.readyState} (${readyStates[websocket.readyState]})`
        );
        process.nextTick(cb, err);
      }
    }
    function receiverOnConclude(code2, reason) {
      const websocket = this[kWebSocket];
      websocket._closeFrameReceived = true;
      websocket._closeMessage = reason;
      websocket._closeCode = code2;
      if (websocket._socket[kWebSocket] === void 0) return;
      websocket._socket.removeListener("data", socketOnData);
      process.nextTick(resume, websocket._socket);
      if (code2 === 1005) websocket.close();
      else websocket.close(code2, reason);
    }
    function receiverOnDrain() {
      const websocket = this[kWebSocket];
      if (!websocket.isPaused) websocket._socket.resume();
    }
    function receiverOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket._socket[kWebSocket] !== void 0) {
        websocket._socket.removeListener("data", socketOnData);
        process.nextTick(resume, websocket._socket);
        websocket.close(err[kStatusCode]);
      }
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function receiverOnFinish() {
      this[kWebSocket].emitClose();
    }
    function receiverOnMessage(data, isBinary) {
      this[kWebSocket].emit("message", data, isBinary);
    }
    function receiverOnPing(data) {
      const websocket = this[kWebSocket];
      if (websocket._autoPong) websocket.pong(data, !this._isServer, NOOP);
      websocket.emit("ping", data);
    }
    function receiverOnPong(data) {
      this[kWebSocket].emit("pong", data);
    }
    function resume(stream) {
      stream.resume();
    }
    function senderOnError(err) {
      const websocket = this[kWebSocket];
      if (websocket.readyState === WebSocket2.CLOSED) return;
      if (websocket.readyState === WebSocket2.OPEN) {
        websocket._readyState = WebSocket2.CLOSING;
        setCloseTimer(websocket);
      }
      this._socket.end();
      if (!websocket._errorEmitted) {
        websocket._errorEmitted = true;
        websocket.emit("error", err);
      }
    }
    function setCloseTimer(websocket) {
      websocket._closeTimer = setTimeout(
        websocket._socket.destroy.bind(websocket._socket),
        websocket._closeTimeout
      );
    }
    function socketOnClose() {
      const websocket = this[kWebSocket];
      this.removeListener("close", socketOnClose);
      this.removeListener("data", socketOnData);
      this.removeListener("end", socketOnEnd);
      websocket._readyState = WebSocket2.CLOSING;
      if (!this._readableState.endEmitted && !websocket._closeFrameReceived && !websocket._receiver._writableState.errorEmitted && this._readableState.length !== 0) {
        const chunk = this.read(this._readableState.length);
        websocket._receiver.write(chunk);
      }
      websocket._receiver.end();
      this[kWebSocket] = void 0;
      clearTimeout(websocket._closeTimer);
      if (websocket._receiver._writableState.finished || websocket._receiver._writableState.errorEmitted) {
        websocket.emitClose();
      } else {
        websocket._receiver.on("error", receiverOnFinish);
        websocket._receiver.on("finish", receiverOnFinish);
      }
    }
    function socketOnData(chunk) {
      if (!this[kWebSocket]._receiver.write(chunk)) {
        this.pause();
      }
    }
    function socketOnEnd() {
      const websocket = this[kWebSocket];
      websocket._readyState = WebSocket2.CLOSING;
      websocket._receiver.end();
      this.end();
    }
    function socketOnError() {
      const websocket = this[kWebSocket];
      this.removeListener("error", socketOnError);
      this.on("error", NOOP);
      if (websocket) {
        websocket._readyState = WebSocket2.CLOSING;
        this.destroy();
      }
    }
  }
});
var require_stream = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/stream.js"(exports, module) {
    "use strict";
    var WebSocket2 = require_websocket();
    var { Duplex } = __require("stream");
    function emitClose(stream) {
      stream.emit("close");
    }
    function duplexOnEnd() {
      if (!this.destroyed && this._writableState.finished) {
        this.destroy();
      }
    }
    function duplexOnError(err) {
      this.removeListener("error", duplexOnError);
      this.destroy();
      if (this.listenerCount("error") === 0) {
        this.emit("error", err);
      }
    }
    function createWebSocketStream2(ws, options) {
      let terminateOnDestroy = true;
      const duplex = new Duplex({
        ...options,
        autoDestroy: false,
        emitClose: false,
        objectMode: false,
        writableObjectMode: false
      });
      ws.on("message", function message(msg, isBinary) {
        const data = !isBinary && duplex._readableState.objectMode ? msg.toString() : msg;
        if (!duplex.push(data)) ws.pause();
      });
      ws.once("error", function error(err) {
        if (duplex.destroyed) return;
        terminateOnDestroy = false;
        duplex.destroy(err);
      });
      ws.once("close", function close() {
        if (duplex.destroyed) return;
        duplex.push(null);
      });
      duplex._destroy = function(err, callback) {
        if (ws.readyState === ws.CLOSED) {
          callback(err);
          process.nextTick(emitClose, duplex);
          return;
        }
        let called = false;
        ws.once("error", function error(err2) {
          called = true;
          callback(err2);
        });
        ws.once("close", function close() {
          if (!called) callback(err);
          process.nextTick(emitClose, duplex);
        });
        if (terminateOnDestroy) ws.terminate();
      };
      duplex._final = function(callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._final(callback);
          });
          return;
        }
        if (ws._socket === null) return;
        if (ws._socket._writableState.finished) {
          callback();
          if (duplex._readableState.endEmitted) duplex.destroy();
        } else {
          ws._socket.once("finish", function finish() {
            callback();
          });
          ws.close();
        }
      };
      duplex._read = function() {
        if (ws.isPaused) ws.resume();
      };
      duplex._write = function(chunk, encoding, callback) {
        if (ws.readyState === ws.CONNECTING) {
          ws.once("open", function open() {
            duplex._write(chunk, encoding, callback);
          });
          return;
        }
        ws.send(chunk, callback);
      };
      duplex.on("end", duplexOnEnd);
      duplex.on("error", duplexOnError);
      return duplex;
    }
    module.exports = createWebSocketStream2;
  }
});
var require_subprotocol = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/subprotocol.js"(exports, module) {
    "use strict";
    var { tokenChars } = require_validation();
    function parse(header) {
      const protocols = /* @__PURE__ */ new Set();
      let start = -1;
      let end = -1;
      let i = 0;
      for (i; i < header.length; i++) {
        const code2 = header.charCodeAt(i);
        if (end === -1 && tokenChars[code2] === 1) {
          if (start === -1) start = i;
        } else if (i !== 0 && (code2 === 32 || code2 === 9)) {
          if (end === -1 && start !== -1) end = i;
        } else if (code2 === 44) {
          if (start === -1) {
            throw new SyntaxError(`Unexpected character at index ${i}`);
          }
          if (end === -1) end = i;
          const protocol2 = header.slice(start, end);
          if (protocols.has(protocol2)) {
            throw new SyntaxError(`The "${protocol2}" subprotocol is duplicated`);
          }
          protocols.add(protocol2);
          start = end = -1;
        } else {
          throw new SyntaxError(`Unexpected character at index ${i}`);
        }
      }
      if (start === -1 || end !== -1) {
        throw new SyntaxError("Unexpected end of input");
      }
      const protocol = header.slice(start, i);
      if (protocols.has(protocol)) {
        throw new SyntaxError(`The "${protocol}" subprotocol is duplicated`);
      }
      protocols.add(protocol);
      return protocols;
    }
    module.exports = { parse };
  }
});
var require_websocket_server = __commonJS({
  "../node_modules/.pnpm/ws@8.21.0_bufferutil@4.0.9/node_modules/ws/lib/websocket-server.js"(exports, module) {
    "use strict";
    var EventEmitter = __require("events");
    var http = __require("http");
    var { Duplex } = __require("stream");
    var { createHash } = __require("crypto");
    var extension2 = require_extension();
    var PerMessageDeflate2 = require_permessage_deflate();
    var subprotocol2 = require_subprotocol();
    var WebSocket2 = require_websocket();
    var { CLOSE_TIMEOUT, GUID, kWebSocket } = require_constants();
    var keyRegex = /^[+/0-9A-Za-z]{22}==$/;
    var RUNNING = 0;
    var CLOSING = 1;
    var CLOSED = 2;
    var WebSocketServer2 = class extends EventEmitter {
      /**
       * Create a `WebSocketServer` instance.
       *
       * @param {Object} options Configuration options
       * @param {Boolean} [options.allowSynchronousEvents=true] Specifies whether
       *     any of the `'message'`, `'ping'`, and `'pong'` events can be emitted
       *     multiple times in the same tick
       * @param {Boolean} [options.autoPong=true] Specifies whether or not to
       *     automatically send a pong in response to a ping
       * @param {Number} [options.backlog=511] The maximum length of the queue of
       *     pending connections
       * @param {Boolean} [options.clientTracking=true] Specifies whether or not to
       *     track clients
       * @param {Number} [options.closeTimeout=30000] Duration in milliseconds to
       *     wait for the closing handshake to finish after `websocket.close()` is
       *     called
       * @param {Function} [options.handleProtocols] A hook to handle protocols
       * @param {String} [options.host] The hostname where to bind the server
       * @param {Number} [options.maxBufferedChunks=1048576] The maximum number of
       *     buffered data chunks
       * @param {Number} [options.maxFragments=131072] The maximum number of message
       *     fragments
       * @param {Number} [options.maxPayload=104857600] The maximum allowed message
       *     size
       * @param {Boolean} [options.noServer=false] Enable no server mode
       * @param {String} [options.path] Accept only connections matching this path
       * @param {(Boolean|Object)} [options.perMessageDeflate=false] Enable/disable
       *     permessage-deflate
       * @param {Number} [options.port] The port where to bind the server
       * @param {(http.Server|https.Server)} [options.server] A pre-created HTTP/S
       *     server to use
       * @param {Boolean} [options.skipUTF8Validation=false] Specifies whether or
       *     not to skip UTF-8 validation for text and close messages
       * @param {Function} [options.verifyClient] A hook to reject connections
       * @param {Function} [options.WebSocket=WebSocket] Specifies the `WebSocket`
       *     class to use. It must be the `WebSocket` class or class that extends it
       * @param {Function} [callback] A listener for the `listening` event
       */
      constructor(options, callback) {
        super();
        options = {
          allowSynchronousEvents: true,
          autoPong: true,
          maxBufferedChunks: 1024 * 1024,
          maxFragments: 128 * 1024,
          maxPayload: 100 * 1024 * 1024,
          skipUTF8Validation: false,
          perMessageDeflate: false,
          handleProtocols: null,
          clientTracking: true,
          closeTimeout: CLOSE_TIMEOUT,
          verifyClient: null,
          noServer: false,
          backlog: null,
          // use default (511 as implemented in net.js)
          server: null,
          host: null,
          path: null,
          port: null,
          WebSocket: WebSocket2,
          ...options
        };
        if (options.port == null && !options.server && !options.noServer || options.port != null && (options.server || options.noServer) || options.server && options.noServer) {
          throw new TypeError(
            'One and only one of the "port", "server", or "noServer" options must be specified'
          );
        }
        if (options.port != null) {
          this._server = http.createServer((req, res) => {
            const body = http.STATUS_CODES[426];
            res.writeHead(426, {
              "Content-Length": body.length,
              "Content-Type": "text/plain"
            });
            res.end(body);
          });
          this._server.listen(
            options.port,
            options.host,
            options.backlog,
            callback
          );
        } else if (options.server) {
          this._server = options.server;
        }
        if (this._server) {
          const emitConnection = this.emit.bind(this, "connection");
          this._removeListeners = addListeners(this._server, {
            listening: this.emit.bind(this, "listening"),
            error: this.emit.bind(this, "error"),
            upgrade: (req, socket, head) => {
              this.handleUpgrade(req, socket, head, emitConnection);
            }
          });
        }
        if (options.perMessageDeflate === true) options.perMessageDeflate = {};
        if (options.clientTracking) {
          this.clients = /* @__PURE__ */ new Set();
          this._shouldEmitClose = false;
        }
        this.options = options;
        this._state = RUNNING;
      }
      /**
       * Returns the bound address, the address family name, and port of the server
       * as reported by the operating system if listening on an IP socket.
       * If the server is listening on a pipe or UNIX domain socket, the name is
       * returned as a string.
       *
       * @return {(Object|String|null)} The address of the server
       * @public
       */
      address() {
        if (this.options.noServer) {
          throw new Error('The server is operating in "noServer" mode');
        }
        if (!this._server) return null;
        return this._server.address();
      }
      /**
       * Stop the server from accepting new connections and emit the `'close'` event
       * when all existing connections are closed.
       *
       * @param {Function} [cb] A one-time listener for the `'close'` event
       * @public
       */
      close(cb) {
        if (this._state === CLOSED) {
          if (cb) {
            this.once("close", () => {
              cb(new Error("The server is not running"));
            });
          }
          process.nextTick(emitClose, this);
          return;
        }
        if (cb) this.once("close", cb);
        if (this._state === CLOSING) return;
        this._state = CLOSING;
        if (this.options.noServer || this.options.server) {
          if (this._server) {
            this._removeListeners();
            this._removeListeners = this._server = null;
          }
          if (this.clients) {
            if (!this.clients.size) {
              process.nextTick(emitClose, this);
            } else {
              this._shouldEmitClose = true;
            }
          } else {
            process.nextTick(emitClose, this);
          }
        } else {
          const server = this._server;
          this._removeListeners();
          this._removeListeners = this._server = null;
          server.close(() => {
            emitClose(this);
          });
        }
      }
      /**
       * See if a given request should be handled by this server instance.
       *
       * @param {http.IncomingMessage} req Request object to inspect
       * @return {Boolean} `true` if the request is valid, else `false`
       * @public
       */
      shouldHandle(req) {
        if (this.options.path) {
          const index = req.url.indexOf("?");
          const pathname = index !== -1 ? req.url.slice(0, index) : req.url;
          if (pathname !== this.options.path) return false;
        }
        return true;
      }
      /**
       * Handle a HTTP Upgrade request.
       *
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @public
       */
      handleUpgrade(req, socket, head, cb) {
        socket.on("error", socketOnError);
        const key = req.headers["sec-websocket-key"];
        const upgrade = req.headers.upgrade;
        const version2 = +req.headers["sec-websocket-version"];
        if (req.method !== "GET") {
          const message = "Invalid HTTP method";
          abortHandshakeOrEmitwsClientError(this, req, socket, 405, message);
          return;
        }
        if (upgrade === void 0 || upgrade.toLowerCase() !== "websocket") {
          const message = "Invalid Upgrade header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (key === void 0 || !keyRegex.test(key)) {
          const message = "Missing or invalid Sec-WebSocket-Key header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
          return;
        }
        if (version2 !== 13 && version2 !== 8) {
          const message = "Missing or invalid Sec-WebSocket-Version header";
          abortHandshakeOrEmitwsClientError(this, req, socket, 400, message, {
            "Sec-WebSocket-Version": "13, 8"
          });
          return;
        }
        if (!this.shouldHandle(req)) {
          abortHandshake(socket, 400);
          return;
        }
        const secWebSocketProtocol = req.headers["sec-websocket-protocol"];
        let protocols = /* @__PURE__ */ new Set();
        if (secWebSocketProtocol !== void 0) {
          try {
            protocols = subprotocol2.parse(secWebSocketProtocol);
          } catch (err) {
            const message = "Invalid Sec-WebSocket-Protocol header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        const secWebSocketExtensions = req.headers["sec-websocket-extensions"];
        const extensions = {};
        if (this.options.perMessageDeflate && secWebSocketExtensions !== void 0) {
          const perMessageDeflate = new PerMessageDeflate2({
            ...this.options.perMessageDeflate,
            isServer: true,
            maxPayload: this.options.maxPayload
          });
          try {
            const offers = extension2.parse(secWebSocketExtensions);
            if (offers[PerMessageDeflate2.extensionName]) {
              perMessageDeflate.accept(offers[PerMessageDeflate2.extensionName]);
              extensions[PerMessageDeflate2.extensionName] = perMessageDeflate;
            }
          } catch (err) {
            const message = "Invalid or unacceptable Sec-WebSocket-Extensions header";
            abortHandshakeOrEmitwsClientError(this, req, socket, 400, message);
            return;
          }
        }
        if (this.options.verifyClient) {
          const info = {
            origin: req.headers[`${version2 === 8 ? "sec-websocket-origin" : "origin"}`],
            secure: !!(req.socket.authorized || req.socket.encrypted),
            req
          };
          if (this.options.verifyClient.length === 2) {
            this.options.verifyClient(info, (verified, code2, message, headers) => {
              if (!verified) {
                return abortHandshake(socket, code2 || 401, message, headers);
              }
              this.completeUpgrade(
                extensions,
                key,
                protocols,
                req,
                socket,
                head,
                cb
              );
            });
            return;
          }
          if (!this.options.verifyClient(info)) return abortHandshake(socket, 401);
        }
        this.completeUpgrade(extensions, key, protocols, req, socket, head, cb);
      }
      /**
       * Upgrade the connection to WebSocket.
       *
       * @param {Object} extensions The accepted extensions
       * @param {String} key The value of the `Sec-WebSocket-Key` header
       * @param {Set} protocols The subprotocols
       * @param {http.IncomingMessage} req The request object
       * @param {Duplex} socket The network socket between the server and client
       * @param {Buffer} head The first packet of the upgraded stream
       * @param {Function} cb Callback
       * @throws {Error} If called more than once with the same socket
       * @private
       */
      completeUpgrade(extensions, key, protocols, req, socket, head, cb) {
        if (!socket.readable || !socket.writable) return socket.destroy();
        if (socket[kWebSocket]) {
          throw new Error(
            "server.handleUpgrade() was called more than once with the same socket, possibly due to a misconfiguration"
          );
        }
        if (this._state > RUNNING) return abortHandshake(socket, 503);
        const digest = createHash("sha1").update(key + GUID).digest("base64");
        const headers = [
          "HTTP/1.1 101 Switching Protocols",
          "Upgrade: websocket",
          "Connection: Upgrade",
          `Sec-WebSocket-Accept: ${digest}`
        ];
        const ws = new this.options.WebSocket(null, void 0, this.options);
        if (protocols.size) {
          const protocol = this.options.handleProtocols ? this.options.handleProtocols(protocols, req) : protocols.values().next().value;
          if (protocol) {
            headers.push(`Sec-WebSocket-Protocol: ${protocol}`);
            ws._protocol = protocol;
          }
        }
        if (extensions[PerMessageDeflate2.extensionName]) {
          const params = extensions[PerMessageDeflate2.extensionName].params;
          const value = extension2.format({
            [PerMessageDeflate2.extensionName]: [params]
          });
          headers.push(`Sec-WebSocket-Extensions: ${value}`);
          ws._extensions = extensions;
        }
        this.emit("headers", headers, req);
        socket.write(headers.concat("\r\n").join("\r\n"));
        socket.removeListener("error", socketOnError);
        ws.setSocket(socket, head, {
          allowSynchronousEvents: this.options.allowSynchronousEvents,
          maxBufferedChunks: this.options.maxBufferedChunks,
          maxFragments: this.options.maxFragments,
          maxPayload: this.options.maxPayload,
          skipUTF8Validation: this.options.skipUTF8Validation
        });
        if (this.clients) {
          this.clients.add(ws);
          ws.on("close", () => {
            this.clients.delete(ws);
            if (this._shouldEmitClose && !this.clients.size) {
              process.nextTick(emitClose, this);
            }
          });
        }
        cb(ws, req);
      }
    };
    module.exports = WebSocketServer2;
    function addListeners(server, map) {
      for (const event of Object.keys(map)) server.on(event, map[event]);
      return function removeListeners() {
        for (const event of Object.keys(map)) {
          server.removeListener(event, map[event]);
        }
      };
    }
    function emitClose(server) {
      server._state = CLOSED;
      server.emit("close");
    }
    function socketOnError() {
      this.destroy();
    }
    function abortHandshake(socket, code2, message, headers) {
      message = message || http.STATUS_CODES[code2];
      headers = {
        Connection: "close",
        "Content-Type": "text/html",
        "Content-Length": Buffer.byteLength(message),
        ...headers
      };
      socket.once("finish", socket.destroy);
      socket.end(
        `HTTP/1.1 ${code2} ${http.STATUS_CODES[code2]}\r
` + Object.keys(headers).map((h2) => `${h2}: ${headers[h2]}`).join("\r\n") + "\r\n\r\n" + message
      );
    }
    function abortHandshakeOrEmitwsClientError(server, req, socket, code2, message, headers) {
      if (server.listenerCount("wsClientError")) {
        const err = new Error(message);
        Error.captureStackTrace(err, abortHandshakeOrEmitwsClientError);
        server.emit("wsClientError", err, socket, req);
      } else {
        abortHandshake(socket, code2, message, headers);
      }
    }
  }
});
var import_stream = __toESM(require_stream(), 1);
var import_extension = __toESM(require_extension(), 1);
var import_permessage_deflate = __toESM(require_permessage_deflate(), 1);
var import_receiver = __toESM(require_receiver(), 1);
var import_sender = __toESM(require_sender(), 1);
var import_subprotocol = __toESM(require_subprotocol(), 1);
var import_websocket = __toESM(require_websocket(), 1);
var import_websocket_server = __toESM(require_websocket_server(), 1);
var wrapper_default = import_websocket.default;
var nodeWebSocket = wrapper_default;
setDefaultWebSocketConstructor(nodeWebSocket);

// node_modules/convex/dist/esm/browser/http_client.js
var __defProp6 = Object.defineProperty;
var __defNormalProp5 = (obj, key, value) => key in obj ? __defProp6(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField5 = (obj, key, value) => __defNormalProp5(obj, typeof key !== "symbol" ? key + "" : key, value);
var STATUS_CODE_UDF_FAILED = 560;
var specifiedFetch = void 0;
var ConvexHttpClient = class {
  /**
   * Create a new {@link ConvexHttpClient}.
   *
   * @param address - The url of your Convex deployment, often provided
   * by an environment variable. E.g. `https://small-mouse-123.convex.cloud`.
   * @param options - An object of options.
   * - `skipConvexDeploymentUrlCheck` - Skip validating that the Convex deployment URL looks like
   * `https://happy-animal-123.convex.cloud` or localhost. This can be useful if running a self-hosted
   * Convex backend that uses a different URL.
   * - `logger` - A logger or a boolean. If not provided, logs to the console.
   * You can construct your own logger to customize logging to log elsewhere
   * or not log at all, or use `false` as a shorthand for a no-op logger.
   * A logger is an object with 4 methods: log(), warn(), error(), and logVerbose().
   * These methods can receive multiple arguments of any types, like console.log().
   * - `auth` - A JWT containing identity claims accessible in Convex functions.
   * This identity may expire so it may be necessary to call `setAuth()` later,
   * but for short-lived clients it's convenient to specify this value here.
   * - `fetch` - A custom fetch implementation to use for all HTTP requests made by this client.
   */
  constructor(address, options) {
    __publicField5(this, "address");
    __publicField5(this, "auth");
    __publicField5(this, "adminAuth");
    __publicField5(this, "encodedTsPromise");
    __publicField5(this, "debug");
    __publicField5(this, "fetchOptions");
    __publicField5(this, "fetch");
    __publicField5(this, "logger");
    __publicField5(this, "mutationQueue", []);
    __publicField5(this, "isProcessingQueue", false);
    if (typeof options === "boolean") {
      throw new Error(
        "skipConvexDeploymentUrlCheck as the second argument is no longer supported. Please pass an options object, `{ skipConvexDeploymentUrlCheck: true }`."
      );
    }
    const opts = options ?? {};
    if (opts.skipConvexDeploymentUrlCheck !== true) {
      validateDeploymentUrl(address);
    }
    this.logger = options?.logger === false ? instantiateNoopLogger({ verbose: false }) : options?.logger !== true && options?.logger ? options.logger : instantiateDefaultLogger({ verbose: false });
    this.address = address;
    this.debug = true;
    this.auth = void 0;
    this.adminAuth = void 0;
    this.fetch = options?.fetch;
    if (options?.auth) {
      this.setAuth(options.auth);
    }
  }
  /**
   * Obtain the {@link ConvexHttpClient}'s URL to its backend.
   * @deprecated Use url, which returns the url without /api at the end.
   *
   * @returns The URL to the Convex backend, including the client's API version.
   */
  backendUrl() {
    return `${this.address}/api`;
  }
  /**
   * Return the address for this client, useful for creating a new client.
   *
   * Not guaranteed to match the address with which this client was constructed:
   * it may be canonicalized.
   */
  get url() {
    return this.address;
  }
  /**
   * Set the authentication token to be used for subsequent queries and mutations.
   *
   * Should be called whenever the token changes (i.e. due to expiration and refresh).
   *
   * @param value - JWT-encoded OpenID Connect identity token.
   */
  setAuth(value) {
    this.clearAuth();
    this.auth = value;
  }
  /**
   * Set admin auth token to allow calling internal queries, mutations, and actions
   * and acting as an identity.
   *
   * @internal
   */
  setAdminAuth(token, actingAsIdentity) {
    this.clearAuth();
    if (actingAsIdentity !== void 0) {
      const bytes = new TextEncoder().encode(JSON.stringify(actingAsIdentity));
      const actingAsIdentityEncoded = btoa(String.fromCodePoint(...bytes));
      this.adminAuth = `${token}:${actingAsIdentityEncoded}`;
    } else {
      this.adminAuth = token;
    }
  }
  /**
   * Clear the current authentication token if set.
   */
  clearAuth() {
    this.auth = void 0;
    this.adminAuth = void 0;
  }
  /**
   * Sets whether the result log lines should be printed on the console or not.
   *
   * @internal
   */
  setDebug(debug) {
    this.debug = debug;
  }
  /**
   * Used to customize the fetch behavior in some runtimes.
   *
   * @internal
   */
  setFetchOptions(fetchOptions) {
    this.fetchOptions = fetchOptions;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Execute a Convex query function at the same timestamp as every other
   * consistent query execution run by this HTTP client.
   *
   * This doesn't make sense for long-lived ConvexHttpClients as Convex
   * backends can read a limited amount into the past: beyond 30 seconds
   * in the past may not be available.
   *
   * Create a new client to use a consistent time.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   *
   * @deprecated This API is experimental: it may change or disappear.
   */
  async consistentQuery(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    const timestampPromise = this.getTimestamp();
    return await this.queryInner(query, queryArgs, { timestampPromise });
  }
  async getTimestamp() {
    if (this.encodedTsPromise) {
      return this.encodedTsPromise;
    }
    return this.encodedTsPromise = this.getTimestampInner();
  }
  async getTimestampInner() {
    const localFetch = this.fetch || specifiedFetch || fetch;
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    const response = await localFetch(`${this.address}/api/query_ts`, {
      ...this.fetchOptions,
      method: "POST",
      headers
    });
    if (!response.ok) {
      throw new Error(await response.text());
    }
    const { ts } = await response.json();
    return ts;
  }
  /**
   * Execute a Convex query function.
   *
   * @param name - The name of the query.
   * @param args - The arguments object for the query. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the query's result.
   */
  async query(query, ...args) {
    const queryArgs = parseArgs(args[0]);
    return await this.queryInner(query, queryArgs, {});
  }
  async queryInner(query, queryArgs, options) {
    const name = getFunctionName(query);
    const args = [convexToJson(queryArgs)];
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const timestamp = options.timestampPromise ? await options.timestampPromise : void 0;
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args,
      ...timestamp ? { ts: timestamp } : {}
    });
    const endpoint = timestamp ? `${this.address}/api/query_at_ts` : `${this.address}/api/query`;
    const response = await localFetch(endpoint, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "query", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async mutationInner(mutation, mutationArgs) {
    const name = getFunctionName(mutation);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(mutationArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/mutation`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "mutation", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  async processMutationQueue() {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;
    while (this.mutationQueue.length > 0) {
      const { mutation, args, resolve, reject } = this.mutationQueue.shift();
      try {
        const result = await this.mutationInner(mutation, args);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    }
    this.isProcessingQueue = false;
  }
  enqueueMutation(mutation, args) {
    return new Promise((resolve, reject) => {
      this.mutationQueue.push({ mutation, args, resolve, reject });
      void this.processMutationQueue();
    });
  }
  /**
   * Execute a Convex mutation function. Mutations are queued by default.
   *
   * @param name - The name of the mutation.
   * @param args - The arguments object for the mutation. If this is omitted,
   * the arguments will be `{}`.
   * @param options - An optional object containing
   * @returns A promise of the mutation's result.
   */
  async mutation(mutation, ...args) {
    const [fnArgs, options] = args;
    const mutationArgs = parseArgs(fnArgs);
    const queued = !options?.skipQueue;
    if (queued) {
      return await this.enqueueMutation(mutation, mutationArgs);
    } else {
      return await this.mutationInner(mutation, mutationArgs);
    }
  }
  /**
   * Execute a Convex action function. Actions are not queued.
   *
   * @param name - The name of the action.
   * @param args - The arguments object for the action. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the action's result.
   */
  async action(action, ...args) {
    const actionArgs = parseArgs(args[0]);
    const name = getFunctionName(action);
    const body = JSON.stringify({
      path: name,
      format: "convex_encoded_json",
      args: [convexToJson(actionArgs)]
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/action`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "action", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
  /**
   * Execute a Convex function of an unknown type. These function calls are not queued.
   *
   * @param name - The name of the function.
   * @param args - The arguments object for the function. If this is omitted,
   * the arguments will be `{}`.
   * @returns A promise of the function's result.
   *
   * @internal
   */
  async function(anyFunction, componentPath, ...args) {
    const functionArgs = parseArgs(args[0]);
    const name = typeof anyFunction === "string" ? anyFunction : getFunctionName(anyFunction);
    const body = JSON.stringify({
      componentPath,
      path: name,
      format: "convex_encoded_json",
      args: convexToJson(functionArgs)
    });
    const headers = {
      "Content-Type": "application/json",
      "Convex-Client": `npm-${version}`
    };
    if (this.adminAuth) {
      headers["Authorization"] = `Convex ${this.adminAuth}`;
    } else if (this.auth) {
      headers["Authorization"] = `Bearer ${this.auth}`;
    }
    const localFetch = this.fetch || specifiedFetch || fetch;
    const response = await localFetch(`${this.address}/api/function`, {
      ...this.fetchOptions,
      body,
      method: "POST",
      headers
    });
    if (!response.ok && response.status !== STATUS_CODE_UDF_FAILED) {
      throw new Error(await response.text());
    }
    const respJSON = await response.json();
    if (this.debug) {
      for (const line of respJSON.logLines ?? []) {
        logForFunction(this.logger, "info", "any", name, line);
      }
    }
    switch (respJSON.status) {
      case "success":
        return jsonToConvex(respJSON.value);
      case "error":
        if (respJSON.errorData !== void 0) {
          throw forwardErrorData(
            respJSON.errorData,
            new ConvexError(respJSON.errorMessage)
          );
        }
        throw new Error(respJSON.errorMessage);
      default:
        throw new Error(`Invalid response: ${JSON.stringify(respJSON)}`);
    }
  }
};
function forwardErrorData(errorData, error) {
  error.data = jsonToConvex(errorData);
  return error;
}

// node_modules/convex/dist/esm/server/pagination.js
var paginationOptsValidator = v.object({
  numItems: v.number(),
  cursor: v.union(v.string(), v.null()),
  endCursor: v.optional(v.union(v.string(), v.null())),
  id: v.optional(v.number()),
  maximumRowsRead: v.optional(v.number()),
  maximumBytesRead: v.optional(v.number())
});

// node_modules/convex/dist/esm/server/components/index.js
function createChildComponents(root, pathParts) {
  const handler2 = {
    get(_, prop) {
      if (typeof prop === "string") {
        const newParts = [...pathParts, prop];
        return createChildComponents(root, newParts);
      } else if (prop === toReferencePath) {
        if (pathParts.length < 1) {
          const found = [root, ...pathParts].join(".");
          throw new Error(
            `API path is expected to be of the form \`${root}.childComponent.functionName\`. Found: \`${found}\``
          );
        }
        return `_reference/childComponent/` + pathParts.join("/");
      } else {
        return void 0;
      }
    }
  };
  return new Proxy({}, handler2);
}
var componentsGeneric = () => createChildComponents("components", []);

// node_modules/convex/dist/esm/server/logVars.js
var REQUEST_ID = Symbol("var.requestId");
var IP = Symbol("var.ip");
var USER_AGENT = Symbol("var.userAgent");
var NOW = Symbol("var.now");
var CONVEX_ACTOR = Symbol("var.convexActor");
var varNames = {
  [REQUEST_ID]: "requestId",
  [IP]: "ip",
  [USER_AGENT]: "userAgent",
  [NOW]: "now",
  [CONVEX_ACTOR]: "convexActor"
};

// node_modules/convex/dist/esm/server/schema.js
var __defProp7 = Object.defineProperty;
var __defNormalProp6 = (obj, key, value) => key in obj ? __defProp7(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField6 = (obj, key, value) => __defNormalProp6(obj, typeof key !== "symbol" ? key + "" : key, value);
var TableDefinition = class {
  /**
   * @internal
   */
  constructor(documentType) {
    __publicField6(this, "indexes");
    __publicField6(this, "stagedDbIndexes");
    __publicField6(this, "searchIndexes");
    __publicField6(this, "stagedSearchIndexes");
    __publicField6(this, "vectorIndexes");
    __publicField6(this, "stagedVectorIndexes");
    __publicField6(this, "validator");
    this.indexes = [];
    this.stagedDbIndexes = [];
    this.searchIndexes = [];
    this.stagedSearchIndexes = [];
    this.vectorIndexes = [];
    this.stagedVectorIndexes = [];
    this.validator = documentType;
  }
  /**
   * This API is experimental: it may change or disappear.
   *
   * Returns indexes defined on this table.
   * Intended for the advanced use cases of dynamically deciding which index to use for a query.
   * If you think you need this, please chime in on ths issue in the Convex JS GitHub repo.
   * https://github.com/get-convex/convex-js/issues/49
   */
  " indexes"() {
    return this.indexes;
  }
  index(name, indexConfig) {
    if (Array.isArray(indexConfig)) {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig
      });
    } else if (indexConfig.staged) {
      this.stagedDbIndexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    } else {
      this.indexes.push({
        indexDescriptor: name,
        fields: indexConfig.fields
      });
    }
    return this;
  }
  searchIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedSearchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.searchIndexes.push({
        indexDescriptor: name,
        searchField: indexConfig.searchField,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  vectorIndex(name, indexConfig) {
    if (indexConfig.staged) {
      this.stagedVectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    } else {
      this.vectorIndexes.push({
        indexDescriptor: name,
        vectorField: indexConfig.vectorField,
        dimensions: indexConfig.dimensions,
        filterFields: indexConfig.filterFields || []
      });
    }
    return this;
  }
  /**
   * Work around for https://github.com/microsoft/TypeScript/issues/57035
   */
  self() {
    return this;
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    const documentType = this.validator.json;
    if (typeof documentType !== "object") {
      throw new Error(
        "Invalid validator: please make sure that the parameter of `defineTable` is valid (see https://docs.convex.dev/database/schemas)"
      );
    }
    return {
      indexes: this.indexes,
      stagedDbIndexes: this.stagedDbIndexes,
      searchIndexes: this.searchIndexes,
      stagedSearchIndexes: this.stagedSearchIndexes,
      vectorIndexes: this.vectorIndexes,
      stagedVectorIndexes: this.stagedVectorIndexes,
      documentType
    };
  }
};
function defineTable(documentSchema) {
  if (isValidator(documentSchema)) {
    return new TableDefinition(documentSchema);
  } else {
    return new TableDefinition(v.object(documentSchema));
  }
}
function addSystemFields(tableName, validator) {
  switch (validator.kind) {
    case "object":
      return validator.extend({
        _id: v.id(tableName),
        _creationTime: v.number()
      });
    case "union":
      return v.union(
        ...validator.members.map(
          (member) => addSystemFields(tableName, member)
        )
      );
    // `v.any()` already permits the system fields.
    case "any":
      return validator;
    default:
      throw new Error(
        `Invalid validator for table "${tableName}": a table's documents must be objects, or a union of objects (see https://docs.convex.dev/database/schemas)`
      );
  }
}
function docValidator(tableName, table) {
  return addSystemFields(tableName, table.validator);
}
function tableInSchema(schema, tableName) {
  const table = schema.tables[tableName];
  if (table === void 0) {
    throw new Error(
      `Table "${tableName}" is not in this schema. Tables in this schema: ${Object.keys(
        schema.tables
      ).join(", ")}`
    );
  }
  return table;
}
var SchemaDefinition = class {
  /**
   * @internal
   */
  constructor(tables, options) {
    __publicField6(this, "tables");
    __publicField6(this, "strictTableNameTypes");
    __publicField6(this, "schemaValidation");
    this.tables = tables;
    this.schemaValidation = options?.schemaValidation === void 0 ? true : options.schemaValidation;
  }
  /**
   * The validator for whole documents of a table in this schema: the table's
   * own validator with the `_id` and `_creationTime` system fields added.
   *
   * @example
   * ```ts
   * export const get = query({
   *   args: { id: schema.id("messages") },
   *   returns: v.union(schema.doc("messages"), v.null()),
   *   handler: (ctx, args) => ctx.db.get(args.id),
   * });
   * ```
   *
   * @param tableName - The name of a table in this schema.
   * @returns A validator matching documents of that table.
   */
  doc(tableName) {
    return docValidator(tableName, tableInSchema(this, tableName));
  }
  /**
   * The validator for IDs of a table in this schema.
   *
   * Same as `v.id(tableName)`, but only accepts tables in this schema.
   *
   * @param tableName - The name of a table in this schema.
   * @returns A validator matching IDs of that table.
   */
  id(tableName) {
    tableInSchema(this, tableName);
    return v.id(tableName);
  }
  /**
   * Export the contents of this definition.
   *
   * This is called internally by the Convex framework.
   * @internal
   */
  export() {
    return JSON.stringify({
      tables: Object.entries(this.tables).map(([tableName, definition]) => {
        const {
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        } = definition.export();
        return {
          tableName,
          indexes,
          stagedDbIndexes,
          searchIndexes,
          stagedSearchIndexes,
          vectorIndexes,
          stagedVectorIndexes,
          documentType
        };
      }),
      schemaValidation: this.schemaValidation
    });
  }
};
function defineSchema(schema, options) {
  return new SchemaDefinition(schema, options);
}
var _systemSchema = defineSchema({
  _scheduled_functions: defineTable({
    name: v.string(),
    args: v.array(v.any()),
    scheduledTime: v.float64(),
    completedTime: v.optional(v.float64()),
    state: v.union(
      v.object({ kind: v.literal("pending") }),
      v.object({ kind: v.literal("inProgress") }),
      v.object({ kind: v.literal("success") }),
      v.object({ kind: v.literal("failed"), error: v.string() }),
      v.object({ kind: v.literal("canceled") })
    )
  }),
  _storage: defineTable({
    sha256: v.string(),
    size: v.float64(),
    contentType: v.optional(v.string())
  })
});

// convex/_generated/api.js
var api = anyApi;
var components = componentsGeneric();

// src/lib/ai/chatbotIndexCache.ts
var STOP_WORDS = /* @__PURE__ */ new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "if",
  "then",
  "else",
  "when",
  "at",
  "by",
  "for",
  "with",
  "about",
  "against",
  "between",
  "into",
  "through",
  "during",
  "before",
  "after",
  "above",
  "below",
  "to",
  "from",
  "up",
  "down",
  "in",
  "out",
  "on",
  "off",
  "over",
  "under",
  "again",
  "further",
  "then",
  "once",
  "here",
  "there",
  "when",
  "where",
  "why",
  "how",
  "all",
  "any",
  "both",
  "each",
  "few",
  "more",
  "most",
  "other",
  "some",
  "such",
  "no",
  "nor",
  "not",
  "only",
  "own",
  "same",
  "so",
  "than",
  "too",
  "very",
  "s",
  "t",
  "can",
  "will",
  "just",
  "don",
  "should",
  "now",
  "tell",
  "me",
  "what",
  "is",
  "are",
  "do",
  "does",
  "explain",
  "show",
  "give",
  "please",
  "our",
  "we",
  "us",
  "i",
  "my",
  "your",
  "you",
  "details",
  "overview",
  "system",
  "scio",
  "stellar"
]);
function tokenizeQuery(text) {
  if (!text) return [];
  const clean = text.toLowerCase().replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
  const words = clean.split(" ");
  const tokens = [];
  for (const w of words) {
    if (w.length < 2 || STOP_WORDS.has(w)) continue;
    let stem = w;
    if (stem.endsWith("ing") && stem.length > 5) stem = stem.slice(0, -3);
    else if (stem.endsWith("tions") && stem.length > 6) stem = stem.slice(0, -5) + "t";
    else if (stem.endsWith("tion") && stem.length > 5) stem = stem.slice(0, -4) + "t";
    else if (stem.endsWith("ies") && stem.length > 4) stem = stem.slice(0, -3) + "y";
    else if (stem.endsWith("es") && stem.length > 4) stem = stem.slice(0, -2);
    else if (stem.endsWith("s") && stem.length > 3) stem = stem.slice(0, -1);
    if (stem && !tokens.includes(stem)) {
      tokens.push(stem);
    }
  }
  return tokens;
}
function computeTokenSimilarity(tokensA, tokensB) {
  if (!tokensA.length || !tokensB.length) return 0;
  const setA = new Set(tokensA);
  const setB = new Set(tokensB);
  let intersection = 0;
  for (const t of setA) {
    if (setB.has(t)) {
      intersection++;
    } else {
      for (const tb of setB) {
        if (t.length > 3 && tb.startsWith(t) || tb.length > 3 && t.startsWith(tb)) {
          intersection += 0.85;
          break;
        }
      }
    }
  }
  const union = setA.size + setB.size - intersection;
  if (union <= 0) return 0;
  const jaccard = intersection / union;
  const coverageA = intersection / setA.size;
  const coverageB = intersection / setB.size;
  return jaccard * 0.4 + Math.max(coverageA, coverageB) * 0.6;
}
var SectorChatbotIndexCache = class {
  sectorIndices = /* @__PURE__ */ new Map();
  maxPerSector = 250;
  constructor() {
    this.seedDefaultKnowledge();
  }
  /**
   * Look up query in the sector's inverted index & semantic cache
   */
  lookup(sector, rawQuery, similarityThreshold = 0.68) {
    const startTime = performance.now();
    const cleanQuery = rawQuery.trim().toLowerCase();
    const queryTokens = tokenizeQuery(cleanQuery);
    const sectorPool = this.sectorIndices.get(sector) || [];
    if (!queryTokens.length || !sectorPool.length) {
      return {
        hit: false,
        matchType: "live_generated",
        similarityScore: 0,
        data: null
      };
    }
    for (const entry of sectorPool) {
      if (entry.query.trim().toLowerCase() === cleanQuery) {
        entry.hitCount++;
        const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
        return {
          hit: true,
          matchType: "exact",
          similarityScore: 1,
          data: {
            ...entry.response,
            provider: `${entry.response.provider} (Cached L1)`,
            cacheMeta: {
              hit: true,
              matchType: "Exact Hash Cache",
              similarityScore: 1,
              latencyMs,
              indexSize: sectorPool.length
            }
          }
        };
      }
    }
    let bestMatch = null;
    let highestSimilarity = 0;
    for (const entry of sectorPool) {
      const score = computeTokenSimilarity(queryTokens, entry.normalizedTokens);
      if (score > highestSimilarity) {
        highestSimilarity = score;
        bestMatch = entry;
      }
    }
    if (bestMatch && highestSimilarity >= similarityThreshold) {
      bestMatch.hitCount++;
      const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
      return {
        hit: true,
        matchType: "semantic_index",
        similarityScore: Math.round(highestSimilarity * 100) / 100,
        data: {
          ...bestMatch.response,
          provider: `${bestMatch.response.provider} (Indexed Cache \xB7 ${Math.round(highestSimilarity * 100)}% Match)`,
          cacheMeta: {
            hit: true,
            matchType: "Semantic Inverted Index",
            similarityScore: Math.round(highestSimilarity * 100) / 100,
            latencyMs,
            indexSize: sectorPool.length
          }
        }
      };
    }
    return {
      hit: false,
      matchType: "live_generated",
      similarityScore: Math.round(highestSimilarity * 100) / 100,
      data: null
    };
  }
  /**
   * Save a newly synthesized AI answer into the sector index cache
   */
  store(sector, rawQuery, response) {
    if (!rawQuery.trim() || !response.text.trim()) return;
    const queryTokens = tokenizeQuery(rawQuery);
    if (!this.sectorIndices.has(sector)) {
      this.sectorIndices.set(sector, []);
    }
    const pool = this.sectorIndices.get(sector);
    const cleanQuery = rawQuery.trim().toLowerCase();
    const existingIndex = pool.findIndex((e) => e.query.trim().toLowerCase() === cleanQuery);
    if (existingIndex >= 0) {
      pool.splice(existingIndex, 1);
    }
    pool.unshift({
      query: rawQuery.trim(),
      normalizedTokens: queryTokens,
      response: {
        ...response,
        // Strip previous cached tags from provider before saving
        provider: response.provider.replace(/\s*\(Cached.*?\)/g, "").replace(/\s*\(Indexed.*?\)/g, "").trim()
      },
      sector,
      timestamp: Date.now(),
      hitCount: 1
    });
    if (pool.length > this.maxPerSector) {
      pool.pop();
    }
  }
  /**
   * Pre-seed high-value industrial knowledge into the inverted index
   */
  seedDefaultKnowledge() {
  }
};
var chatbotIndexCache = new SectorChatbotIndexCache();

// src/lib/ai/skillEmbeddings.ts
var SKILL_KNOWLEDGE_CHUNKS = [
  // --- PLATFORM CORE & ARCHITECTURE ---
  {
    id: "platform-overview-core",
    sector: "all",
    category: "Platform Overview",
    title: "Stellar SCIO Enterprise Operations Platform Overview",
    keywords: ["what is scio", "platform overview", "roi", "savings", "uptime", "early warning", "false alarms"],
    compactFact: "Stellar SCIO unifies machines, SCADA, logs & supply chain into one cockpit. Saves $1.4M-$2.8M/site/yr, 99.98% uptime, 91% fewer false alarms, 14-21d early breakdown warning. Zero hardware overhaul.",
    content: "Stellar SCIO is an enterprise AI software platform that bridges the physical-digital divide by unifying industrial machinery, sensor telemetry, maintenance logs, supply chain logistics, and ERP systems into a centralized, real-time command cockpit. It delivers $1.4M to $2.8M in annual cost savings per site by eliminating emergency downtime, maintains 99.98% fleet uptime, reduces false alarms by 91% through contextual multi-sensor corroboration, and predicts catastrophic machine breakdowns 14 to 21 days in advance. It requires zero hardware rip-and-replace by connecting side-by-side with existing SCADA, PLCs, and historians.",
    suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
  },
  {
    id: "platform-intelligence-loop",
    sector: "all",
    category: "Architecture",
    title: "The 4-Step Closed-Loop Intelligence Cycle",
    keywords: ["how it works", "4 step", "connect", "understand", "predict", "act", "closed loop", "digital twin"],
    compactFact: "4-Step Closed-Loop: 1.CONNECT (OPC-UA/Modbus/MQTT/PLCs) \u2794 2.UNDERSTAND (digital twin) \u2794 3.PREDICT (vibration/thermal models 14-21d early) \u2794 4.ACT (auto-creates SAP PM/Maximo work orders).",
    content: "Stellar SCIO operates on a continuous 4-step intelligence cycle:\n1. CONNECT: Ingests real-time telemetry from industrial machines, PLCs, and SCADA historians using standard protocols (OPC-UA, Modbus, MQTT, Siemens S7, Rockwell) without hardware disruption.\n2. UNDERSTAND: Fuses high-frequency sensor streams with operating manuals, asset bills-of-materials (BOM), and historical work orders to build a living semantic Digital Twin.\n3. PREDICT: Runs multi-variate anomaly detection and physics-informed ML models to forecast mechanical wear, cavitation, electrical degradation, and supply chain bottlenecks 14 to 21 days early.\n4. ACT: Automatically synthesizes actionable mitigation plans, drafts maintenance work orders in SAP S/4HANA PM or IBM Maximo, and reserves or orders critical spare parts.",
    suggestedAction: { type: "scroll", label: "View Architecture & 4-Step Loop", payload: "#how-it-works" }
  },
  {
    id: "platform-data-sovereignty",
    sector: "all",
    category: "Security & Sovereignty",
    title: "100% Data Sovereignty, Security & Air-Gapped Deployment",
    keywords: ["security", "data sovereignty", "on-premise", "private cloud", "nerc-cip", "soc2", "air-gapped", "encryption"],
    compactFact: "100% Data Sovereignty: On-Premise & Private Cloud (AWS/Azure/GCP GovCloud, air-gapped). NERC-CIP & SOC2 Type II compliant, TLS 1.3 & AES-256. Operational data never leaves client boundary.",
    content: "Stellar SCIO guarantees 100% Data Sovereignty for mission-critical operations. The platform can be deployed 100% On-Premise on bare-metal servers or inside customer-owned private VPCs (AWS GovCloud, Azure Government, Google Cloud Assured Workloads) and air-gapped SCADA environments. Operational telemetry and equipment data never leave your enterprise security boundary. Complies with SOC 2 Type II, NERC-CIP (Critical Infrastructure Protection), ISO 27001, and ISO 55001 standards, with end-to-end TLS 1.3 encryption in transit and AES-256 at rest.",
    suggestedAction: { type: "open_beta", label: "Request Security & Compliance Spec" }
  },
  {
    id: "platform-erp-integrations",
    sector: "all",
    category: "Integrations",
    title: "Enterprise ERP & Industrial Protocol Integration",
    keywords: ["integrations", "opc-ua", "modbus", "mqtt", "sap", "maximo", "netsuite", "siemens", "rockwell"],
    compactFact: "Protocols: OPC-UA, Modbus TCP/RTU, MQTT Sparkplug B, Siemens S7, Rockwell. ERPs: SAP S/4HANA PM (auto-drafts IW21/IW31 work orders, MB21 reservations), IBM Maximo, Oracle NetSuite.",
    content: "Stellar SCIO integrates plug-and-play with existing industrial automation and enterprise resource planning software:\n\u2022 Protocols: Native connectors for OPC-UA / OPC-DA, Modbus TCP/RTU, MQTT Sparkplug B, Siemens S7, and Rockwell Ethernet/IP.\n\u2022 SAP S/4HANA PM: Automated generation of maintenance notifications (IW21) and work orders (IW31), with real-time spare parts inventory reservation (MB21).\n\u2022 IBM Maximo: Direct REST/MIF synchronization of asset failure codes, work packages, and technician labor scheduling.\n\u2022 Oracle NetSuite & Microsoft Dynamics 365: Purchase requisitions and supplier delivery performance sync.",
    suggestedAction: { type: "scroll", label: "Explore Supported Connectors", payload: "#integrations" }
  },
  // --- RENEWABLE ENERGY & POWER GRID ---
  {
    id: "energy-occ-operations",
    sector: "energy",
    category: "Renewable Energy",
    title: "Renewable Energy Central Operations Room (OCC)",
    keywords: ["energy occ", "grid operations", "power dispatch", "solar yield", "wind generation", "bess battery", "spinning reserves"],
    compactFact: "Energy OCC (12.4GW live): Real-time CO2 offsets, green share %, spinning reserves MW, Recharts solar/wind/BESS vs ERCOT load, frequency containment reserve stabilizer.",
    content: "The Central Operations Room (OCC) provides command-level visibility across 12.4 GW of clean energy capacity:\n\u2022 Grid Performance Indicators: Real-time CO\u2082 Offsets (tonnes), Green Share Ratio (%), Spinning Reserves Capacity (MW), and SCADA Average Equipment Health (0-100%).\n\u2022 Live Energy Dispatch Chart: 24-hour rolling Recharts visual plotting live Solar yields, Wind generator yields, and active BESS battery charging/discharging curves matched against Grid Demand Load (MW).\n\u2022 Sourced Generation Mix: Real-time generation percentage breakdown across Solar PV, Wind Ridges, and BESS capacity blocks.\n\u2022 Grid Stabilizer Advisory Console: Predictive automated advice for frequency containment reserves (FCR) and reactive power voltage adjustments.",
    suggestedAction: { type: "launch_occ", label: "Open Energy Control Room", payload: { industry: "energy", tab: "energy-dashboard" } }
  },
  {
    id: "energy-plants-registry",
    sector: "energy",
    category: "Renewable Energy",
    title: "Fleet Infrastructure & 9 Utility Power Plants Registry",
    keywords: ["power plants", "mojave solar", "desert sunlight", "hornsdale storage", "sweetwater wind", "substations", "bess capacity"],
    compactFact: "9 Active Plants: Mojave Solar One (350MW, 96% health), Desert Sunlight (550MW, 92%), Hornsdale BESS (150MW/193MWh, 99%), Sweetwater Wind (585MW, 88%), Roscoe Wind (781MW, 90%), Moss Landing BESS (400MW, 98%).",
    content: "Stellar SCIO monitors 9 utility-scale generation plants in the fleet registry:\n1. Mojave Solar One (Solar PV, 350 MW, Barstow CA, Health: 96%)\n2. Desert Sunlight (Solar PV, 550 MW, Riverside CA, Health: 92%)\n3. Hornsdale Storage (BESS, 150 MW / 193.5 MWh, South Australia, Health: 99%)\n4. Sweetwater Wind (Wind, 585 MW, Nolan County TX, Health: 88%)\n5. Columbia Gorge Hydro (Hydro, 420 MW, Cascade Locks OR, Health: 94%)\n6. Roscoe Wind Farm (Wind, 781 MW, Roscoe TX, Health: 90%)\n7. Moss Landing Facility (BESS, 400 MW / 1600 MWh, Monterey County CA, Health: 98%)\n8. Copper Mountain Solar (Solar PV, 802 MW, Boulder City NV, Health: 95%)\n9. Tehachapi Pass Wind (Wind, 705 MW, Kern County CA, Health: 84%)\nDisplays live ambient temperature, solar irradiance (W/m\xB2), rotor RPM, blade pitch angles, and grid AC voltage profiles.",
    suggestedAction: { type: "launch_occ", label: "Explore Plants Directory", payload: { industry: "energy", tab: "energy-plants" } }
  },
  {
    id: "energy-scio-flow-texas",
    sector: "energy",
    category: "Renewable Energy",
    title: "SCIO Flow Explorer & Texas ERCOT Transmission Map",
    keywords: ["ercot", "texas grid", "transmission map", "linear grid path", "substation nodes", "el paso", "abilene", "austin"],
    compactFact: "ERCOT Texas Flow: Animated grid power transfers (El Paso solar, Abilene wind, Austin/San Antonio substations). 10-step diagnostics: Infrastructure\u2794Site\u2794Asset\u2794Field\u2794Condition\u2794Maint\u2794Materials\u2794Supply\u2794Compliance\u2794Intel.",
    content: "The SCIO Flow Explorer visualizes the linear path of energy through an interactive Texas ERCOT SVG transmission map:\n\u2022 Animated transmission lines display active power transfers between West Texas solar generation zones (El Paso), Northern wind clusters (Abilene), and Central substation nodes (Austin/San Antonio).\n\u2022 10-Step Sequential Diagnostics Ticker: Infrastructure \u2794 Site \u2794 Asset \u2794 Field Job \u2794 Condition \u2794 Maintenance \u2794 Materials \u2794 Supply \u2794 Compliance \u2794 Intelligence.\nAllows operators to isolate bottlenecks and trace individual node health logs across the entire grid value chain.",
    suggestedAction: { type: "launch_occ", label: "Open SCIO Flow Explorer", payload: { industry: "energy", tab: "energy-scio-flow" } }
  },
  {
    id: "energy-asset-reliability",
    sector: "energy",
    category: "Renewable Energy",
    title: "Equipment Reliability, Gearbox Vibration & MTBF/MTTR",
    keywords: ["wind turbine health", "gearbox vibration", "bearing wear", "blade pitch", "inverter efficiency", "mtbf", "mttr"],
    compactFact: "Energy Reliability: Wind gearbox vibration spectra & bearing wear detected 14-21d early. Blade pitch torque transient checks. Solar inverter IGBT efficiency & BESS thermal runaway prevention. MTBF/MTTR tracking.",
    content: "Predictive asset diagnostics for renewable generation infrastructure:\n\u2022 Wind Turbines: Continuous vibration spectra monitoring on gearbox high-speed stages and main bearings to detect pitting and spalling 14 to 21 days before catastrophic failure.\n\u2022 Blade Pitch Drives: Tracks hydraulic pressure transients and electric pitch actuator current draw to prevent aerodynamic imbalances.\n\u2022 Solar Inverters & BESS: Thermographic and electrical telemetry tracking string current imbalance, IGBT degradation, inverter conversion efficiency, and battery cell thermal runaway risks.\n\u2022 Reliability Metrics: Mean Time Between Failures (MTBF) and Mean Time To Repair (MTTR) gauges with automated root-cause recommendations.",
    suggestedAction: { type: "launch_occ", label: "View Asset Health Registry", payload: { industry: "energy", tab: "energy-assets" } }
  },
  // --- MARITIME FLEET OPERATIONS ---
  {
    id: "maritime-fleet-tracking",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Global Maritime Fleet Tracking & AIS Satellite Telemetry",
    keywords: ["maritime fleet", "ship tracking", "vessels", "stellar voyager", "pacific pioneer", "ais gps", "port eta", "charter rates"],
    compactFact: "Maritime Fleet: 48 ships tracked via satellite AIS: Stellar Voyager (14k TEU container), Pacific Pioneer (180k DWT bulk), Atlantic Horizon (158k DWT crude), Nordic Star (174k m3 LNG). Live SOG/COG, ETAs, charter earnings.",
    content: "Stellar SCIO tracks 48 commercial cargo vessels worldwide using real-time satellite AIS telematics:\n\u2022 Monitored Fleet: Container Ships (e.g. Stellar Voyager, 14,000 TEU, Singapore \u2794 Rotterdam), Capesize Bulk Carriers (Pacific Pioneer, 180,000 DWT), Suezmax Crude Tankers (Atlantic Horizon, 158,000 DWT), and LNG Carriers (Nordic Star, 174,000 m\xB3).\n\u2022 Live Telemetry: GPS coordinates, speed over ground (SOG, knots), course over ground (COG), route waypoints, port arrival estimates (ETA), and daily charter earnings ($/day).\n\u2022 Weather Routing: Dynamic oceanic voyage optimization matching sea swell, wind vectors, and bunker consumption.",
    suggestedAction: { type: "launch_occ", label: "Launch Maritime Fleet Center", payload: { industry: "maritime", tab: "dashboard" } }
  },
  {
    id: "maritime-engine-diagnostics",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Ship Main Engine Health & Mechanical Telemetry",
    keywords: ["ship engine", "cylinder temperature", "oil pressure", "turbocharger vibration", "engine failure", "fuel injector fouling"],
    compactFact: "Marine Engine: Exhaust cylinder temps (Cyl #4: 398\xB0C), lube oil differential pressure, turbocharger vibration harmonics. Catches fuel injector fouling and crankpin bearing wear 18d before sea breakdown.",
    content: "Continuous mechanical diagnostics for marine main engines and auxiliary generators:\n\u2022 Cylinder Combustion: Real-time exhaust gas temperatures (e.g. peak cylinder #4 at 398\xB0C), scavenging air pressures, and peak firing pressures.\n\u2022 Lubrication & Bearings: Oil differential pressure across filters, sump oil viscosity, and main crankpin bearing temperature monitoring.\n\u2022 Failure Preemption: Detects fuel injector nozzle fouling, turbocharger surging, and exhaust valve blow-by 18 days before engine breakdown at sea.\n\u2022 Automated Alerts: Dispatches immediate maintenance instructions to shipboard chief engineers.",
    suggestedAction: { type: "launch_occ", label: "Inspect Vessel Telemetry", payload: { industry: "maritime", tab: "dashboard" } }
  },
  {
    id: "maritime-bunker-management",
    sector: "maritime",
    category: "Maritime Operations",
    title: "Bunker Fuel Logs, Consumption Rates & IMO CII Compliance",
    keywords: ["bunker fuel", "mgo", "hfo", "fuel consumption", "sulfur content", "imo cii", "bunkering port"],
    compactFact: "Bunker & Fuel: MGO & HFO ROB (metric tons), daily fuel burn rate vs speed, IMO 0.50% sulfur compliance, CII ratings (A-E), automated bunkering requisition 5d before destination port arrival.",
    content: "Comprehensive maritime bunker and environmental compliance management:\n\u2022 Fuel Tank Stocks: Live tracking of Marine Gas Oil (MGO) and Heavy Fuel Oil (HFO) Remaining on Board (ROB, metric tons).\n\u2022 Burn Rates: Calculates daily fuel consumption rates (MT/day) relative to vessel speed, sea state, and draft displacement.\n\u2022 Sulfur Cap & CII: Validates fuel sulfur content (% mass) against the IMO 0.50% global sulfur cap, and tracks Carbon Intensity Indicator (CII ratings A to E).\n\u2022 Port Bunkering: Flags refueling requirements 5 days before arrival, automating bunker delivery coordination at destination berths.",
    suggestedAction: { type: "launch_occ", label: "Open Bunker Fuel Console", payload: { industry: "maritime", tab: "bunker" } }
  },
  {
    id: "maritime-safety-compliance",
    sector: "maritime",
    category: "Maritime Operations",
    title: "SOLAS/MARPOL Safety Inspections & Port State Control (PSC)",
    keywords: ["safety inspection", "lifeboats", "fire alarms", "port state control", "psc deficiencies", "capa", "0 detentions"],
    compactFact: "Marine Safety: SOLAS/MARPOL digital checklists (lifeboats, fire pumps, watertight doors). Port State Control (PSC) CAPA tracking with DNV/LR/ABS. 94% inspection pass rate, 0 port detentions.",
    content: "Ensures continuous regulatory inspection readiness across all vessels:\n\u2022 Digital Safety Checklists: Scheduled audits for lifeboats and davit winches, CO\u2082 fixed fire suppression stations, emergency fire pumps, watertight bulkhead doors, and immersion suits.\n\u2022 Port State Control (PSC): Tracks deficiencies and Corrective Actions (CAPA) with classification societies (DNV, Lloyd's Register, ABS).\n\u2022 Track Record: Stellar SCIO maintains a 94% inspection pass rate and 0 port detentions across all monitored fleets.",
    suggestedAction: { type: "launch_occ", label: "View Marine Safety Hub", payload: { industry: "maritime", tab: "safety" } }
  },
  // --- MANUFACTURING 4.0 & FACTORY OEE ---
  {
    id: "mfg-oee-tracking",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "Real-Time Factory OEE & Robotic Assembly Line Metrics",
    keywords: ["oee", "overall equipment effectiveness", "availability", "performance", "quality", "downtime", "robotic cells"],
    compactFact: "Factory OEE: Availability x Performance x Quality across 24 robotic cells (91.4% avg). Flags micro-stoppages & conveyor jams. Delivers +11.2% OEE, -38% downtime, -64% defect escapes.",
    content: "Real-time Overall Equipment Effectiveness (OEE) tracking across automated shopfloors:\n\u2022 OEE Calculation: Multiplies Availability \xD7 Performance \xD7 Quality across 24 robotic assembly cells and CNC lines (achieving 91.4% average fleet OEE).\n\u2022 Availability: Flags unpredicted downtime, tool changeover latencies, and mechanical faults.\n\u2022 Performance: Tracks actual machine cycle speeds against rated cycle time, identifying micro-stoppages (<5 min) and feeder conveyor jams that cause cumulative production losses.\n\u2022 Business Impact: Delivers +11.2% OEE improvement, -38% unplanned downtime, and -64% defect escapes within two quarters.",
    suggestedAction: { type: "launch_occ", label: "Open Manufacturing Cockpit", payload: { industry: "manufacturing", tab: "dashboard" } }
  },
  {
    id: "mfg-asset-maintenance",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "CNC Spindle Vibration, Acoustic Bearing Wear & Tool Maintenance",
    keywords: ["cnc spindle", "spindle vibration", "tool wear", "bearing wear", "sap work order", "plant maintenance"],
    compactFact: "Factory Maintenance: CNC spindle & robot joint vibration (Robotic Arm Joint 3: 4.2mm/s RMS), thermal hotspots (82.1\xB0C), tool wear. Auto-drafts SAP PM work orders with vibration signatures.",
    content: "Industrial machine diagnostics and automated work order generation:\n\u2022 High-Frequency Vibration: Monitors CNC machine spindle bearings and robotic joints (e.g. Robotic Arm Joint 3 at 4.2 mm/s RMS) to catch bearing wear before catastrophic tool breakdown.\n\u2022 Thermal Telemetry: High-speed infrared sensors detect spindle motor thermal hotspots (peaking at 82.1\xB0C during high-speed milling).\n\u2022 SAP PM Integration: Automatically auto-drafts tool changeover and corrective work orders in SAP S/4HANA PM with attached vibration spectra and parts reservations.",
    suggestedAction: { type: "launch_occ", label: "Open Asset Maintenance Hub", payload: { industry: "manufacturing", tab: "maintenance" } }
  },
  {
    id: "mfg-quality-vision",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "AI Computer Vision Quality Inspection & Full Traceability",
    keywords: ["quality inspection", "computer vision", "defect detection", "traceability", "first pass yield", "scrap rate"],
    compactFact: "Quality & Vision: 100% optical camera inspection for surface cracks, dimensional tolerances, weld seam porosity. Auto-quarantine routing & batch/lot ingot-to-serial number traceability.",
    content: "Quality assurance and closed-loop defect elimination:\n\u2022 In-Line Vision AI: Optical cameras inspect 100% of finished and semi-finished parts for surface cracks, dimensional tolerances, and weld seam porosity.\n\u2022 Automated Quarantine: Defective parts are automatically diverted to rework bays without stopping primary line flow.\n\u2022 Complete Traceability: Full batch and lot traceability linking raw material ingot lots to final assembled serial numbers.",
    suggestedAction: { type: "launch_occ", label: "View Quality & Traceability", payload: { industry: "manufacturing", tab: "quality" } }
  },
  {
    id: "mfg-production-planning",
    sector: "manufacturing",
    category: "Smart Factory",
    title: "Dynamic Production Planning, Line Balancing & Takt Time",
    keywords: ["production planning", "line scheduling", "takt time", "throughput", "shift quota"],
    compactFact: "Production Planning: Adaptive line balancing & takt time pacing. Re-routes orders away from degrading cells undergoing maintenance onto high-health lines. Shift throughput analytics.",
    content: "Intelligent shopfloor production management:\n\u2022 Adaptive Scheduling: Dynamically paces takt time across work centers based on live machine health and operator throughput.\n\u2022 Load Balancing: Routes orders away from degrading cells undergoing predictive maintenance onto parallel high-health stations.\n\u2022 Shift Analytics: Compares shift-over-shift performance and isolates operational bottlenecks.",
    suggestedAction: { type: "launch_occ", label: "Open Production Planning", payload: { industry: "manufacturing", tab: "planning" } }
  },
  // --- LOGISTICS & COLD-CHAIN SUPPLY ---
  {
    id: "logistics-coldchain-reefer",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Cold-Chain Reefer IoT Temperature & Humidity Telemetry",
    keywords: ["cold chain", "reefer", "refrigerated container", "temperature control", "temperature excursion", "pharma"],
    compactFact: "Cold-Chain: Reefer IoT telemetry (-25\xB0C to +4\xB0C, Reefer #RC-804) logged every 15s. Alerts on +/-0.5\xB0C drift, door openings, compressor spikes, and defrost cycles to protect cargo.",
    content: "High-precision thermal monitoring for perishable and pharmaceutical freight:\n\u2022 Continuous Telemetry: High-frequency IoT sensors log internal container temperature (-25\xB0C to +4\xB0C) every 15 seconds across refrigerated reefers (e.g. Reefer #RC-804).\n\u2022 Excursion Alerts: Instant notifications alert operators when temperature drifts beyond threshold (+/- 0.5\xB0C delta), door seals open unexpectedly, or refrigerant compressor pressure spikes.\n\u2022 Defrost Cycle Tracking: Logs defrost cycles to protect biologics, vaccines, and frozen perishables from thermal degradation.",
    suggestedAction: { type: "launch_occ", label: "Open Cold-Chain Monitor", payload: { industry: "logistics", tab: "cold-chain" } }
  },
  {
    id: "logistics-congestion-forecasting",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Port & Rail Congestion Forecasting & Demurrage Mitigation",
    keywords: ["port congestion", "shipping delay", "demurrage", "freight delay", "rail dwell time", "bottlenecks"],
    compactFact: "Supply Chain Bottlenecks: Port yard congestion & rail dwell times predicted 6-9d ahead. Dynamic container re-routing avoids $320K/yr demurrage. +17.8% on-time delivery, 96.4% ETA accuracy.",
    content: "Machine learning bottleneck forecasting across global freight corridors:\n\u2022 Predictive Lead Time: Forecasts port yard bottlenecks, terminal congestion, and rail dwell times 6 to 9 days in advance.\n\u2022 Demurrage Avoidance: Automatically recommends dynamic container re-routing and accelerated chassis pickups, avoiding $320,000+ in carrier demurrage and detention fees annually.\n\u2022 Delivery Reliability: Proven +17.8% improvement in On-Time In-Full (OTIF) delivery with 96.4% ETA prediction accuracy.",
    suggestedAction: { type: "launch_occ", label: "Open Supply Chain Tower", payload: { industry: "logistics", tab: "dashboard" } }
  },
  {
    id: "logistics-multimodal-map",
    sector: "logistics",
    category: "Cold-Chain Logistics",
    title: "Multimodal Live Fleet Map & Regional Warehouse Spare Parts",
    keywords: ["multimodal map", "fleet map", "warehouse stock", "spare parts sync", "automated po", "purchase orders"],
    compactFact: "Multimodal & Spares: Live GIS map tracking intermodal containers across vessels, trucks, and rail. Warehouse MRO stock synced with field work orders. Automated POs below safety threshold.",
    content: "Unified supply chain visibility and MRO inventory harmonization:\n\u2022 Multimodal Live GIS Map: Interactive map tracking intermodal containers across ocean freight vessels, linehaul trucks, and freight rail corridors.\n\u2022 Warehouse MRO Spares: Synchronizes central warehouse stock levels directly with field technician repair requests across distribution hubs.\n\u2022 Automated Purchase Orders: Automatically generates purchase requisitions when critical spare parts drop below safety stock thresholds, updating locked maintenance schedules.",
    suggestedAction: { type: "launch_occ", label: "Open Multimodal Map", payload: { industry: "logistics", tab: "multimodal-map" } }
  }
];
var DOMAIN_CONCEPT_VOCAB = [
  "scio",
  "stellar",
  "platform",
  "enterprise",
  "downtime",
  "savings",
  "roi",
  "twin",
  "connect",
  "understand",
  "predict",
  "act",
  "sovereignty",
  "on-premise",
  "private",
  "soc2",
  "nerc-cip",
  "security",
  "encryption",
  "protocol",
  "opc-ua",
  "modbus",
  "mqtt",
  "sap",
  "maximo",
  "workorder",
  "maintenance",
  "spares",
  "inventory",
  "supplier",
  "energy",
  "power",
  "grid",
  "renewable",
  "solar",
  "wind",
  "bess",
  "battery",
  "megawatt",
  "dispatch",
  "load",
  "frequency",
  "substation",
  "mojave",
  "hornsdale",
  "desert",
  "sweetwater",
  "roscoe",
  "turbine",
  "gearbox",
  "vibration",
  "bearing",
  "pitch",
  "inverter",
  "irradiance",
  "thermal",
  "ercot",
  "texas",
  "transmission",
  "co2",
  "maritime",
  "fleet",
  "ship",
  "vessel",
  "voyage",
  "ais",
  "satellite",
  "gps",
  "voyager",
  "pioneer",
  "horizon",
  "nordic",
  "engine",
  "cylinder",
  "temperature",
  "pressure",
  "turbocharger",
  "bunker",
  "fuel",
  "mgo",
  "hfo",
  "consumption",
  "sulfur",
  "cii",
  "imo",
  "safety",
  "solas",
  "marpol",
  "lifeboat",
  "inspection",
  "psc",
  "detention",
  "manufacturing",
  "factory",
  "oee",
  "robotic",
  "cell",
  "availability",
  "performance",
  "quality",
  "stoppage",
  "conveyor",
  "jam",
  "cycle",
  "cnc",
  "spindle",
  "acoustic",
  "tooling",
  "wear",
  "vision",
  "camera",
  "defect",
  "scrap",
  "tolerance",
  "traceability",
  "takt",
  "logistics",
  "supply",
  "chain",
  "cold",
  "reefer",
  "container",
  "temperature",
  "excursion",
  "delay",
  "forecast",
  "port",
  "congestion",
  "demurrage",
  "rail",
  "dwell",
  "multimodal",
  "truck",
  "freight",
  "warehouse",
  "stock",
  "reorder",
  "purchase",
  "po"
];
var VOCAB_DIMENSION = 128;
function computeDenseEmbedding(text) {
  const vector = new Float32Array(VOCAB_DIMENSION);
  if (!text) return Array.from(vector);
  const clean = text.toLowerCase().replace(/[^\w\s-]/g, " ");
  const words = clean.split(/\s+/).filter((w) => w.length > 1);
  for (let i = 0; i < DOMAIN_CONCEPT_VOCAB.length; i++) {
    const concept = DOMAIN_CONCEPT_VOCAB[i];
    const targetDim = i % VOCAB_DIMENSION;
    let count = 0;
    for (const w of words) {
      if (w === concept) {
        count += 2;
      } else if (w.includes(concept) || concept.includes(w)) {
        count += 0.8;
      }
    }
    if (count > 0) {
      vector[targetDim] += count;
    }
  }
  for (const word of words) {
    if (word.length >= 3) {
      for (let i = 0; i <= word.length - 3; i++) {
        const trigram = word.slice(i, i + 3);
        let hash = 0;
        for (let j = 0; j < 3; j++) {
          hash = hash * 31 + trigram.charCodeAt(j) & 2147483647;
        }
        const dim = hash % VOCAB_DIMENSION;
        vector[dim] += 0.15;
      }
    }
  }
  let norm = 0;
  for (let i = 0; i < VOCAB_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }
  norm = Math.sqrt(norm);
  const result = new Array(VOCAB_DIMENSION);
  if (norm > 0) {
    for (let i = 0; i < VOCAB_DIMENSION; i++) {
      result[i] = vector[i] / norm;
    }
  } else {
    for (let i = 0; i < VOCAB_DIMENSION; i++) {
      result[i] = 0;
    }
  }
  return result;
}
for (const chunk of SKILL_KNOWLEDGE_CHUNKS) {
  const combinedText = `${chunk.title} ${chunk.category} ${chunk.keywords.join(" ")} ${chunk.compactFact} ${chunk.content}`;
  chunk.embedding = computeDenseEmbedding(combinedText);
}
function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  return Math.max(0, Math.min(1, dotProduct));
}
function searchSkillEmbeddings(rawSector, rawQuery, topK = 2) {
  const sector = (rawSector || "home").toLowerCase();
  const query = (rawQuery || "").trim();
  if (!query) return [];
  const queryEmbedding = computeDenseEmbedding(query);
  const scoredChunks = [];
  for (const chunk of SKILL_KNOWLEDGE_CHUNKS) {
    if (!chunk.embedding) continue;
    let baseSim = cosineSimilarity(queryEmbedding, chunk.embedding);
    let sectorBonus = 0;
    if (chunk.sector === sector) {
      sectorBonus = 0.22;
    } else if (chunk.sector === "all") {
      sectorBonus = sector === "home" || sector === "general" ? 0.2 : 0.08;
    }
    const queryLower = query.toLowerCase();
    for (const kw of chunk.keywords) {
      if (queryLower.includes(kw)) {
        baseSim += 0.15;
        break;
      }
    }
    const finalScore = Math.min(1, baseSim + sectorBonus);
    const sentences = chunk.content.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 15);
    scoredChunks.push({
      chunk,
      similarity: Math.round(finalScore * 100) / 100,
      extractedKeyPoints: sentences.slice(0, 2)
    });
  }
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  return scoredChunks.slice(0, topK);
}
function getRetrievedCompactFacts(results, maxChunks = 2) {
  if (!results.length) return "";
  return results.slice(0, maxChunks).map((r) => `\u2022 ${r.chunk.compactFact}`).join("\n");
}
function synthesizeDynamicResponse(rawSector, rawQuery, retrieved) {
  const sector = (rawSector || "home").toLowerCase();
  if (!retrieved.length) {
    return {
      text: `**Stellar SCIO Platform Operational Intelligence**:

\u2022 **Unified Operations**: Stellar SCIO connects industrial machinery across Renewable Energy, Maritime Fleets, Manufacturing 4.0, and Logistics into one real-time dashboard.
\u2022 **14-Day Early Warning**: Detects bearing, thermal, and vibration wear 14 to 21 days before breakdown.
\u2022 **Data Sovereignty**: 100% on-premise and private cloud architecture ensures operational data stays on your own servers.
\u2022 **Automated Work Orders**: Integrates directly with SAP S/4HANA PM and IBM Maximo to auto-draft repairs.`,
      provider: "Stellar SCIO Vector Synthesizer",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }
  const primary = retrieved[0];
  const secondary = retrieved[1] || retrieved[0];
  const bulletPoints = [];
  bulletPoints.push(primary.chunk.compactFact);
  if (secondary.chunk.id !== primary.chunk.id) {
    bulletPoints.push(secondary.chunk.compactFact);
  }
  const title = primary.chunk.title;
  const intro = `**${title}**:

`;
  const formattedText = intro + bulletPoints.map((b) => `\u2022 ${b}`).join("\n\n");
  const suggestedAction = primary.chunk.suggestedAction || secondary.chunk.suggestedAction || {
    type: "launch_occ",
    label: `Open ${sector.toUpperCase()} Operations Center`,
    payload: { industry: sector, tab: "dashboard" }
  };
  return {
    text: formattedText,
    provider: `Stellar SCIO Vector Intelligence (${primary.chunk.category})`,
    suggestedAction
  };
}

// src/lib/ai/chatbotEngine.ts
async function persistChatToConvex(sector, userText, botText, provider, suggestedAction) {
  try {
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (!convexUrl) return;
    const client2 = new ConvexHttpClient(convexUrl);
    const timeStr = (/* @__PURE__ */ new Date()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    let formattedAction = void 0;
    if (suggestedAction) {
      let normPayload = void 0;
      if (typeof suggestedAction.payload === "string") {
        normPayload = { target: suggestedAction.payload };
      } else if (typeof suggestedAction.payload === "object" && suggestedAction.payload !== null) {
        normPayload = {};
        for (const [k, v2] of Object.entries(suggestedAction.payload)) {
          normPayload[k] = String(v2);
        }
      }
      formattedAction = {
        type: String(suggestedAction.type || ""),
        label: String(suggestedAction.label || ""),
        payload: normPayload
      };
    }
    await client2.mutation(api.mutations.saveChatMessage, {
      industry: sector,
      sender: "user",
      text: userText,
      timestamp: timeStr
    });
    await client2.mutation(api.mutations.saveChatMessage, {
      industry: sector,
      sender: "bot",
      text: botText,
      timestamp: timeStr,
      provider,
      suggestedAction: formattedAction
    });
  } catch (err) {
    console.warn("Convex chat history persistence warning:", err);
  }
}
var TOKEN_LIMITS = {
  maxInputChars: 1200,
  maxOutputTokens: 250,
  // Token-efficient output cap
  maxResponseChars: 1500
};
var PRODUCT_KNOWLEDGE_BASE = {
  platformName: "Stellar SCIO Platform",
  overview: "Stellar SCIO connects industrial machines, sensors, maintenance logs, and ERP systems (SAP/Maximo) into one central dashboard, predicting breakdowns 14-21 days early.",
  sectors: {
    home: { name: "Stellar SCIO Platform", tagline: "ENTERPRISE OPERATIONS SOFTWARE" },
    general: { name: "Stellar SCIO Platform", tagline: "ENTERPRISE OPERATIONS SOFTWARE" },
    energy: { name: "Renewable Energy & Power Grid", tagline: "12.4 GW MANAGED LIVE" },
    maritime: { name: "Maritime Fleet Operations", tagline: "GLOBAL FLEET MANAGEMENT" },
    manufacturing: { name: "Manufacturing 4.0 & Factory OEE", tagline: "SMART FACTORY OPERATIONS" },
    logistics: { name: "Logistics & Cold-Chain Supply", tagline: "SUPPLY CHAIN CONTROL" }
  }
};
function sanitizeInput(query) {
  if (!query) return "";
  let clean = query.slice(0, TOKEN_LIMITS.maxInputChars);
  clean = clean.replace(/<\|endoftext\|>/g, "").replace(/\[SYSTEM_PROMPT\]/gi, "");
  return clean.trim();
}
function truncateResponse(text) {
  if (!text) return "";
  if (text.length <= TOKEN_LIMITS.maxResponseChars) return text;
  const sliced = text.slice(0, TOKEN_LIMITS.maxResponseChars);
  const lastPeriod = Math.max(sliced.lastIndexOf("."), sliced.lastIndexOf("\n"));
  if (lastPeriod > TOKEN_LIMITS.maxResponseChars * 0.7) {
    return sliced.slice(0, lastPeriod + 1);
  }
  return sliced + "...";
}
function normalizeSectorKey(rawSector) {
  const s = (rawSector || "").toLowerCase().trim();
  if (s.includes("manufactur") || s.includes("factory") || s.includes("oee") || s.includes("plant")) return "manufacturing";
  if (s.includes("maritime") || s.includes("ship") || s.includes("fleet") || s.includes("vessel")) return "maritime";
  if (s.includes("logistics") || s.includes("cold") || s.includes("supply") || s.includes("reefer")) return "logistics";
  if (s.includes("energy") || s.includes("power") || s.includes("grid") || s.includes("renewable")) return "energy";
  if (s === "general") return "general";
  return "home";
}
function buildSystemPrompt(rawSector, compactFacts) {
  const sector = normalizeSectorKey(rawSector);
  return `You are the official Stellar SCIO AI Assistant (${sector.toUpperCase()} Operations).
Answer the user's inquiry concisely in 2-3 bullet points strictly using these vector-retrieved operational facts:
${compactFacts}

Guardrails:
\u2022 Ground answers strictly in Stellar SCIO industrial operations.
\u2022 Politely decline requests for generic programming code (Python/Flask/C++), homework, or off-topic trivia.
\u2022 Keep response brief, direct, and factual.`;
}
function generateIntelligentFallback(rawSector, query, retrievedChunks) {
  const sector = normalizeSectorKey(rawSector);
  const lower = query.toLowerCase().trim();
  const isOffTopic = lower.includes("sindhi") || lower.includes("teach me") || lower.includes("write code") || lower.includes("write backend") || lower.includes("python code") || lower.includes("flask") || lower.includes("write script") || lower.includes("homework") || lower.includes("recipe") || lower.includes("translate");
  if (isOffTopic) {
    return {
      text: `I am the official **Stellar SCIO Platform Assistant**.

My purpose is to assist you with the **Stellar SCIO Platform** \u2014 answering questions about our features, enterprise ROI, and industrial operations across Renewable Energy, Maritime, Manufacturing, and Logistics.

How can I help you explore Stellar SCIO today?`,
      provider: "Stellar SCIO AI Assistant",
      suggestedAction: { type: "open_beta", label: "Apply for Private Beta Access" }
    };
  }
  const isGreeting = /^(\s*(hi+|hello+|hey+|hola|greetings|good\s+(morning|afternoon|evening)|who\s+are\s+you|help)\s*[\!\?.]*)$/i.test(lower);
  if (isGreeting) {
    const sectorData = PRODUCT_KNOWLEDGE_BASE.sectors[sector] || PRODUCT_KNOWLEDGE_BASE.sectors.home;
    return {
      text: `**Hello! Welcome to ${sectorData.name} Operations** \u{1F44B}

I am your live industrial intelligence assistant powered by Stellar SCIO's dynamic vector knowledge base.

\u2022 **Operational Telemetry**: Real-time asset health, vibration, and thermal diagnostics.
\u2022 **Early Warning**: Machine failure predictions 14 to 21 days in advance.
\u2022 **ERP Integration**: Automated work orders in SAP PM and IBM Maximo.
\u2022 **Data Sovereignty**: 100% on-premise and private cloud architecture.

What operational insight or asset health would you like to explore today?`,
      provider: `${sectorData.name} Assistant`,
      suggestedAction: {
        type: "launch_occ",
        label: `Launch ${sectorData.name} Cockpit`,
        payload: { industry: sector, tab: "dashboard" }
      }
    };
  }
  const chunksToUse = retrievedChunks || searchSkillEmbeddings(sector, query, 3);
  return synthesizeDynamicResponse(sector, query, chunksToUse);
}
async function generateResponse(rawSector, rawQuery) {
  const sector = normalizeSectorKey(rawSector);
  const query = sanitizeInput(rawQuery);
  if (!query) {
    return { error: "Query is required" };
  }
  const retrievedChunks = searchSkillEmbeddings(sector, query, 2);
  const compactFacts = getRetrievedCompactFacts(retrievedChunks, 2);
  let aiText = "";
  let provider = "Stellar SCIO Vector AI";
  let suggestedAction = null;
  if (retrievedChunks.length > 0 && retrievedChunks[0].chunk.suggestedAction) {
    suggestedAction = retrievedChunks[0].chunk.suggestedAction;
  }
  let mistralKey = process.env.MISTRAL_API_KEY || "";
  if (sector === "maritime") {
    mistralKey = process.env.MISTRAL_API_KEY_MARITIME || process.env.MARITIME_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "energy") {
    mistralKey = process.env.MISTRAL_API_KEY_ENERGY || process.env.ENERGY_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "manufacturing") {
    mistralKey = process.env.MISTRAL_API_KEY_MANUFACTURING || process.env.MANUFACTURING_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "logistics") {
    mistralKey = process.env.MISTRAL_API_KEY_LOGISTICS || process.env.LOGISTICS_MISTRAL_API_KEY || mistralKey;
  } else if (sector === "home" || sector === "general") {
    mistralKey = process.env.MISTRAL_API_KEY_HOMEPAGE || mistralKey;
  }
  const systemPrompt2 = buildSystemPrompt(sector, compactFacts);
  if (mistralKey) {
    try {
      const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${mistralKey}`
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            { role: "system", content: systemPrompt2 },
            { role: "user", content: query }
          ],
          temperature: 0.25,
          max_tokens: TOKEN_LIMITS.maxOutputTokens
        })
      });
      if (response.ok) {
        const data = await response.json();
        aiText = data.choices?.[0]?.message?.content || "";
        provider = `Stellar SCIO Dynamic Copilot (${sector.toUpperCase()})`;
      }
    } catch (err) {
      console.warn(`Mistral API call failed for sector ${sector}:`, err);
    }
  }
  const geminiKey = process.env.GEMINI_API_KEY || "";
  if (!aiText && geminiKey) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: `${systemPrompt2}

User Question: ${query}` }]
              }
            ],
            generationConfig: {
              maxOutputTokens: TOKEN_LIMITS.maxOutputTokens,
              temperature: 0.25
            }
          })
        }
      );
      if (response.ok) {
        const data = await response.json();
        aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        provider = `Stellar SCIO Dynamic Copilot (Gemini Grounded)`;
      }
    } catch (err) {
      console.warn(`Gemini API call failed for sector ${sector}:`, err);
    }
  }
  const openaiKey = process.env.OPENAI_API_KEY || "";
  if (!aiText && openaiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt2 },
            { role: "user", content: query }
          ],
          temperature: 0.25,
          max_tokens: TOKEN_LIMITS.maxOutputTokens
        })
      });
      if (response.ok) {
        const data = await response.json();
        aiText = data.choices?.[0]?.message?.content || "";
        provider = `Stellar SCIO Dynamic Copilot (OpenAI Grounded)`;
      }
    } catch (err) {
      console.warn(`OpenAI API call failed for sector ${sector}:`, err);
    }
  }
  if (!aiText) {
    const fallback = generateIntelligentFallback(sector, query, retrievedChunks);
    aiText = fallback.text;
    provider = fallback.provider;
    if (!suggestedAction) {
      suggestedAction = fallback.suggestedAction;
    }
  }
  aiText = truncateResponse(aiText);
  if (!suggestedAction) {
    if (sector === "home" || sector === "general") {
      suggestedAction = { type: "open_beta", label: "Apply for Private Beta Access" };
    } else {
      suggestedAction = {
        type: "launch_occ",
        label: `Launch ${sector.charAt(0).toUpperCase() + sector.slice(1)} Control Room`,
        payload: { industry: sector, tab: "dashboard" }
      };
    }
  }
  const finalResponse = {
    text: aiText,
    provider,
    suggestedAction,
    cacheMeta: {
      hit: false,
      matchType: "Vector Embeddings RAG",
      similarityScore: retrievedChunks[0]?.similarity || 0.95,
      topMatchedChunk: retrievedChunks[0]?.chunk.title || "Stellar SCIO Knowledge",
      latencyMs: 12,
      indexSize: retrievedChunks.length
    }
  };
  persistChatToConvex(
    sector,
    query,
    aiText,
    provider,
    suggestedAction
  );
  chatbotIndexCache.store(sector, query, {
    text: aiText,
    provider,
    suggestedAction
  });
  return finalResponse;
}

// src/demo/data/rng.ts
function createRng(seed) {
  let a = seed >>> 0;
  const next = () => {
    a = a + 1831565813 >>> 0;
    let t = a;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  return {
    next,
    range: (min, max) => min + next() * (max - min),
    int: (min, max) => Math.floor(min + next() * (max - min + 1)),
    pick: (arr2) => arr2[Math.floor(next() * arr2.length)],
    chance: (p) => next() < p,
    /** Approximately normal noise (mean 0, sd 1). */
    gauss: () => {
      let u = 0;
      let v2 = 0;
      while (u === 0) u = next();
      while (v2 === 0) v2 = next();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v2);
    }
  };
}

// src/demo/data/generate.ts
var COMPANY_NAME = "SCIO";
var USD_TO_AED = 3.6725;
var HISTORY_DAYS = 365;
var SENSOR_DAYS = 90;
var SEED = 20261112;
var DAY = 864e5;
function toIso(d) {
  return d.toISOString().slice(0, 10);
}
function addDays(d, days) {
  return new Date(d.getTime() + days * DAY);
}
var WAREHOUSES = [
  { id: "WH-A", name: "Warehouse A \xB7 Central DC", city: "Dubai" },
  { id: "WH-B", name: "Warehouse B \xB7 Regional Hub", city: "Riyadh" },
  { id: "WH-C", name: "Warehouse C \xB7 Plant Store", city: "Dammam" }
];
var SUPPLIER_DEFS = [
  ["Gulf Bearing Supply", "UAE", "Bearings & Seals"],
  ["Al Waha Industrial Trading", "Saudi Arabia", "Mechanical Parts"],
  ["Nordic Seal Systems", "Sweden", "Bearings & Seals"],
  ["Desert Hydraulics Co.", "UAE", "Hydraulics"],
  ["Peninsula Electrical", "Qatar", "Electrical"],
  ["Rhein Antriebstechnik", "Germany", "Motors & Drives"],
  ["Oasis Filtration", "Oman", "Filters"],
  ["Coastal Fasteners", "UAE", "Fasteners"],
  ["Indus Belt & Drive", "India", "Belts & Chains"],
  ["Falcon Lubricants", "UAE", "Lubricants"],
  ["Pacific Packaging Materials", "Singapore", "Packaging"],
  ["Safeguard PPE Trading", "Saudi Arabia", "Safety & PPE"],
  ["Anatolia Valve Works", "Turkey", "Valves & Fittings"],
  ["Lumen Automation", "Japan", "Sensors & Automation"],
  ["Crescent Pumps & Spares", "Kuwait", "Pump Spares"],
  ["Meridian Compressor Parts", "Italy", "Compressor Spares"],
  ["Bahrain Steel Components", "Bahrain", "Mechanical Parts"],
  ["Sahara Electrical Wholesale", "Egypt", "Electrical"]
];
var ITEM_TEMPLATES = [
  ["Deep Groove Ball Bearing 6205", "Bearings & Seals", [8, 18]],
  ["Spherical Roller Bearing 22216", "Bearings & Seals", [140, 260]],
  ["Mechanical Seal Kit 45mm", "Bearings & Seals", [180, 420]],
  ["Oil Seal 60x80x8", "Bearings & Seals", [4, 9]],
  ['Hydraulic Hose Assembly 1/2"', "Hydraulics", [35, 80]],
  ["Hydraulic Cylinder Seal Kit", "Hydraulics", [60, 150]],
  ["Directional Control Valve 24V", "Hydraulics", [420, 900]],
  ["Contactor 3P 40A", "Electrical", [55, 120]],
  ["Motor Protection Breaker 16A", "Electrical", [70, 140]],
  ["Variable Frequency Drive 7.5kW", "Motors & Drives", [900, 1600]],
  ["Electric Motor 5.5kW IE3", "Motors & Drives", [650, 1200]],
  ["Coupling Element Spider", "Motors & Drives", [12, 30]],
  ["Air Filter Element", "Filters", [25, 60]],
  ["Hydraulic Return Filter", "Filters", [30, 75]],
  ["Oil Separator Cartridge", "Compressor Spares", [210, 380]],
  ["Compressor Valve Plate", "Compressor Spares", [320, 640]],
  ["Impeller 150mm Bronze", "Pump Spares", [380, 720]],
  ["Pump Wear Ring Set", "Pump Spares", [90, 190]],
  ["V-Belt SPB 2000", "Belts & Chains", [14, 32]],
  ["Conveyor Belt Splice Kit", "Belts & Chains", [120, 260]],
  ["Roller Chain 16B Duplex (5m)", "Belts & Chains", [95, 180]],
  ["Hex Bolt M16x60 (box 50)", "Fasteners", [18, 36]],
  ["Anchor Bolt M20 (box 20)", "Fasteners", [40, 80]],
  ["Gear Oil ISO VG 220 (20L)", "Lubricants", [85, 140]],
  ["Lithium Grease EP2 (18kg)", "Lubricants", [95, 160]],
  ["Stretch Film 500mm Roll", "Packaging", [9, 16]],
  ["Corrugated Carton 600x400", "Packaging", [1.2, 2.4]],
  ["Safety Gloves Cut-Resistant (pair)", "Safety & PPE", [4, 9]],
  ["Safety Helmet Class E", "Safety & PPE", [12, 22]],
  ["Gate Valve DN50 PN16", "Valves & Fittings", [110, 230]],
  ['Ball Valve 2" Stainless', "Valves & Fittings", [75, 160]],
  ["Proximity Sensor M18", "Sensors & Automation", [45, 95]],
  ["Pressure Transmitter 0-16 bar", "Sensors & Automation", [240, 480]],
  ["Vibration Sensor 100mV/g", "Sensors & Automation", [190, 380]],
  ["Shaft Sleeve 50mm", "Mechanical Parts", [60, 130]],
  ["Gearbox Output Shaft", "Mechanical Parts", [520, 980]]
];
var ASSET_TYPES = [
  { type: "Pump", prefix: "P", categories: ["Pump Spares", "Bearings & Seals", "Motors & Drives"], pressure: [5.5, 7.5] },
  { type: "Compressor", prefix: "C", categories: ["Compressor Spares", "Filters", "Lubricants"], pressure: [7, 9.5] },
  { type: "Conveyor", prefix: "CV", categories: ["Belts & Chains", "Bearings & Seals", "Motors & Drives"], pressure: [0, 0] },
  { type: "Forklift", prefix: "FL", categories: ["Hydraulics", "Filters", "Lubricants"], pressure: [150, 180] },
  { type: "Generator", prefix: "G", categories: ["Filters", "Electrical", "Lubricants"], pressure: [3, 4.5] },
  { type: "Packaging Line", prefix: "PL", categories: ["Packaging", "Sensors & Automation", "Belts & Chains"], pressure: [5.5, 6.5] },
  { type: "Hydraulic Press", prefix: "HP", categories: ["Hydraulics", "Valves & Fittings", "Electrical"], pressure: [180, 210] },
  { type: "Mixer", prefix: "MX", categories: ["Mechanical Parts", "Bearings & Seals", "Motors & Drives"], pressure: [0, 0] }
];
var SITES = ["Dubai Distribution Centre", "Riyadh Hub", "Dammam Plant"];
function weightedCriticality(rng) {
  const r = rng.next();
  if (r < 0.15) return "Critical";
  if (r < 0.4) return "High";
  if (r < 0.8) return "Medium";
  return "Low";
}
function round(n, dp = 2) {
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
function generateDataset(anchor = /* @__PURE__ */ new Date()) {
  const rng = createRng(SEED);
  const today = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));
  const suppliers = SUPPLIER_DEFS.map(([name, country, category], i) => ({
    id: `SUP-${String(i + 1).padStart(3, "0")}`,
    name,
    country,
    category,
    promisedLeadDays: rng.int(7, 35)
  }));
  const supplierDelayMean = /* @__PURE__ */ new Map();
  suppliers.forEach((s, i) => {
    const chronic = i === 2 || i === 5 || i === 13;
    supplierDelayMean.set(s.id, chronic ? rng.range(2, 3.5) : rng.range(-3.5, -1));
  });
  const items = [];
  let skuCounter = 1e3;
  for (const [name, category, [cMin, cMax]] of ITEM_TEMPLATES) {
    const candidates = suppliers.filter((s) => s.category === category);
    for (const wh of WAREHOUSES) {
      if (!rng.chance(0.85)) continue;
      const supplier = candidates.length ? rng.pick(candidates) : rng.pick(suppliers);
      const usdCost = rng.range(cMin, cMax);
      const unitCost = round(usdCost * USD_TO_AED);
      const baseRate = usdCost < 20 ? rng.range(6, 22) : usdCost < 150 ? rng.range(1.2, 6) : rng.range(0.1, 1.2);
      const profile = rng.next();
      const rising = profile < 0.15;
      const slow = profile > 0.9;
      const dailyUsage = [];
      for (let d = 0; d < HISTORY_DAYS; d++) {
        const date = addDays(today, d - HISTORY_DAYS);
        const weekday = date.getUTCDay();
        const weekly = weekday === 5 ? 0.35 : weekday === 6 ? 0.7 : 1.08;
        const seasonal = 1 + 0.18 * Math.sin(2 * Math.PI * (d + 60) / 365);
        const trend = rising ? 1 + 1.1 * d / HISTORY_DAYS : 1;
        const rate = (slow ? baseRate * 0.06 : baseRate) * weekly * seasonal * trend;
        const noisy = rate + rng.gauss() * Math.sqrt(Math.max(rate, 0.05)) * 0.6;
        dailyUsage.push(Math.max(0, Math.round(noisy)));
      }
      const leadTimeDays = supplier.promisedLeadDays;
      const avgDaily = dailyUsage.slice(-60).reduce((a, b) => a + b, 0) / 60;
      const minStock = Math.max(2, Math.ceil(avgDaily * leadTimeDays * 0.5));
      const ltDemand = avgDaily * leadTimeDays;
      const maxStock = Math.max(minStock + 5, Math.ceil(minStock + ltDemand + avgDaily * 45));
      let stock;
      if (slow) stock = Math.ceil(maxStock * rng.range(1.4, 3.2));
      else if (rng.chance(0.055)) stock = Math.floor(minStock * rng.range(0.1, 0.85));
      else if (rng.chance(0.08)) stock = Math.ceil(rng.range(minStock * 1.1, minStock + ltDemand * 0.9));
      else stock = Math.ceil(rng.range(minStock + ltDemand * 1.15, maxStock));
      items.push({
        id: `SKU-${skuCounter++}`,
        name,
        category,
        warehouseId: wh.id,
        supplierId: supplier.id,
        unitCost,
        minStock,
        maxStock,
        stock,
        leadTimeDays,
        criticality: usdCost > 300 ? rng.chance(0.6) ? "Critical" : "High" : weightedCriticality(rng),
        dailyUsage
      });
    }
  }
  const assets = [];
  const assetCounts = {
    Pump: 8,
    Compressor: 5,
    Conveyor: 6,
    Forklift: 6,
    Generator: 3,
    "Packaging Line": 4,
    "Hydraulic Press": 3,
    Mixer: 3
  };
  const faultyAssets = /* @__PURE__ */ new Set();
  for (const def of ASSET_TYPES) {
    for (let n = 1; n <= assetCounts[def.type]; n++) {
      const id = `${def.prefix}-${100 + n}`;
      const siteIdx = rng.int(0, SITES.length - 1);
      const site = SITES[siteIdx];
      const serviceIntervalDays = rng.pick([60, 90, 120, 180]);
      const overdue = rng.chance(0.07);
      const daysSinceService = overdue ? serviceIntervalDays + rng.int(3, 45) : rng.int(5, serviceIntervalDays - 1);
      const lastService = addDays(today, -daysSinceService);
      const nextService = addDays(lastService, serviceIntervalDays);
      const whForSite = WAREHOUSES[siteIdx].id;
      const partPool = items.filter((it) => it.warehouseId === whForSite && def.categories.includes(it.category));
      const partIds = Array.from(new Set(Array.from({ length: 3 }, () => partPool.length ? rng.pick(partPool).id : ""))).filter(Boolean);
      const isFaulty = rng.chance(0.06) || id === "P-102";
      if (isFaulty) faultyAssets.add(id);
      const faultStart = SENSOR_DAYS - rng.int(7, 14);
      const vibBase = rng.range(1.6, 3.2);
      const [pLo, pHi] = def.pressure;
      const pBase = pHi > 0 ? rng.range(pLo, pHi) : 0;
      const vibration = [];
      const pressure = [];
      for (let d = 0; d < SENSOR_DAYS; d++) {
        const drift = isFaulty && d >= faultStart ? (d - faultStart + 1) * rng.range(0.25, 0.45) : 0;
        vibration.push(round(Math.max(0.3, vibBase + drift + rng.gauss() * 0.25)));
        const pDrop = isFaulty && d >= faultStart && pBase > 0 ? -(d - faultStart + 1) * pBase * 8e-3 : 0;
        pressure.push(pBase > 0 ? round(pBase + pDrop + rng.gauss() * pBase * 0.015) : 0);
      }
      assets.push({
        id,
        name: `${def.type} ${id}`,
        type: def.type,
        site,
        criticality: weightedCriticality(rng),
        installedYear: rng.int(2012, 2023),
        lastServiceDate: toIso(lastService),
        serviceIntervalDays,
        nextServiceDate: toIso(nextService),
        runningHours: rng.int(4e3, 42e3),
        partIds,
        vibration,
        pressure
      });
    }
  }
  const dueThisWeek2 = assets.filter((a) => {
    const diff = (new Date(a.nextServiceDate).getTime() - today.getTime()) / DAY;
    return diff >= -30 && diff <= 7;
  });
  for (const a of dueThisWeek2.slice(0, 3)) {
    const part = items.find((it) => it.id === a.partIds[0]);
    if (part) {
      part.stock = Math.floor(part.minStock * 0.3);
      part.criticality = "Critical";
    }
  }
  const inspections = [];
  const findingsByType = {
    Pump: ["Seal weeping at gland", "Bearing noise detected", "Coupling misalignment"],
    Compressor: ["Oil carry-over above limit", "Intake filter clogged", "Valve leakage"],
    Conveyor: ["Belt edge fraying", "Idler roller seized", "Splice wear"],
    Forklift: ["Hydraulic hose abrasion", "Mast chain stretch", "Brake wear"],
    Generator: ["Fuel filter restriction", "Loose terminal", "Exhaust leak"],
    "Packaging Line": ["Sensor misreads", "Sealing jaw wear", "Guard interlock fault"],
    "Hydraulic Press": ["Cylinder seal leak", "Pressure fluctuation", "Valve sticking"],
    Mixer: ["Gearbox noise", "Shaft runout", "Agitator blade wear"]
  };
  let inspCounter = 1;
  const repeatFailers = new Set(assets.filter((_, i) => i % 9 === 4).map((a) => a.id));
  for (const a of assets) {
    for (let q = 4; q >= 1; q--) {
      const date = addDays(today, -q * 90 + rng.int(-10, 10));
      const failP = repeatFailers.has(a.id) ? 0.8 : faultyAssets.has(a.id) && q === 1 ? 0.7 : 0.1;
      const fail = rng.chance(failP);
      inspections.push({
        id: `INS-${String(inspCounter++).padStart(4, "0")}`,
        assetId: a.id,
        date: toIso(date),
        result: fail ? "Fail" : "Pass",
        finding: fail ? rng.pick(findingsByType[a.type]) : "No defects found"
      });
    }
  }
  const purchaseOrders = [];
  let poCounter = 1;
  for (const it of items) {
    const sup = suppliers.find((s) => s.id === it.supplierId);
    const delayMean = supplierDelayMean.get(sup.id) ?? 0;
    const annualUsage = it.dailyUsage.reduce((a, b) => a + b, 0);
    const orders = Math.max(1, Math.min(10, Math.round(annualUsage / Math.max(1, it.maxStock - it.minStock))));
    for (let k = 0; k < orders; k++) {
      const orderDate = addDays(today, -HISTORY_DAYS + Math.floor((k + rng.next()) * HISTORY_DAYS / orders));
      const promised = addDays(orderDate, sup.promisedLeadDays);
      const delay = Math.round(delayMean + rng.gauss() * (delayMean > 0 ? 3.2 : 2.2));
      const delivered = addDays(promised, delay);
      const isOpen = delivered.getTime() > today.getTime();
      const priceDrift = 1 + k / orders * 0.06;
      const anomaly = rng.chance(0.03) ? rng.range(1.18, 1.35) : 1;
      purchaseOrders.push({
        id: `PO-${String(24e3 + poCounter++)}`,
        supplierId: sup.id,
        itemId: it.id,
        quantity: Math.max(1, Math.round(annualUsage / orders * rng.range(0.85, 1.15))),
        unitPrice: round(it.unitCost * priceDrift * anomaly * rng.range(0.97, 1.03)),
        orderDate: toIso(orderDate),
        promisedDate: toIso(promised),
        deliveredDate: isOpen ? null : toIso(delivered)
      });
    }
  }
  purchaseOrders.sort((a, b) => a.orderDate.localeCompare(b.orderDate));
  const irng = createRng(SEED + 7);
  const invSeq = /* @__PURE__ */ new Map();
  const invoices = purchaseOrders.filter((p) => p.deliveredDate && p.deliveredDate < toIso(addDays(today, -10))).map((p) => {
    const n = (invSeq.get(p.supplierId) ?? 1e3 + irng.int(0, 400)) + irng.int(1, 9);
    invSeq.set(p.supplierId, n);
    const prefix = (suppliers.find((s) => s.id === p.supplierId)?.name ?? "SUP").replace(/[^A-Za-z ]/g, "").split(" ").map((w) => w[0]).join("").slice(0, 3).toUpperCase();
    const date = addDays(/* @__PURE__ */ new Date(p.deliveredDate + "T00:00:00Z"), irng.int(0, 4));
    const net = p.quantity * p.unitPrice;
    return {
      number: `${prefix}-INV-${n}`,
      supplierId: p.supplierId,
      poId: p.id,
      date: toIso(date),
      quantity: p.quantity,
      unitPrice: p.unitPrice,
      total: round(net * 1.05),
      status: date.getTime() < today.getTime() - 20 * DAY ? "Paid" : "Approved"
    };
  });
  const drng = createRng(SEED + 11);
  const BREAKDOWN_CAUSES = {
    Pump: ["Mechanical seal failure", "Bearing overheating", "Motor trip"],
    Compressor: ["High discharge temperature trip", "Valve failure", "Oil pressure low"],
    Conveyor: ["Belt misalignment", "Drive motor fault", "Roller seizure"],
    Forklift: ["Hydraulic leak", "Battery fault", "Mast chain issue"],
    Generator: ["Fuel filter blockage", "AVR fault", "Cooling fan failure"],
    "Packaging Line": ["Sealer jam", "Sensor misalignment", "PLC fault"],
    "Hydraulic Press": ["Cylinder seal leak", "Pressure loss", "Control valve stuck"],
    Mixer: ["Gearbox failure", "Coupling wear", "Motor overload"]
  };
  const downtime = [];
  let dtN = 1;
  for (const a of assets) {
    const breakdowns = faultyAssets.has(a.id) ? drng.int(3, 6) : a.criticality === "Critical" ? drng.int(1, 3) : drng.int(0, 2);
    for (let i = 0; i < breakdowns; i++) {
      const daysAgo = faultyAssets.has(a.id) && i === 0 ? drng.int(1, 9) : drng.int(3, 88);
      downtime.push({ id: `DT-${String(dtN++).padStart(4, "0")}`, assetId: a.id, start: toIso(addDays(today, -daysAgo)), hours: round(drng.range(2, faultyAssets.has(a.id) ? 30 : 18)), type: "Breakdown", cause: drng.pick(BREAKDOWN_CAUSES[a.type]) });
    }
    const last = /* @__PURE__ */ new Date(a.lastServiceDate + "T00:00:00Z");
    for (let t = last.getTime(); t > today.getTime() - 90 * DAY; t -= a.serviceIntervalDays * DAY) {
      downtime.push({ id: `DT-${String(dtN++).padStart(4, "0")}`, assetId: a.id, start: toIso(new Date(t)), hours: round(drng.range(6, 16)), type: "Planned", cause: "Preventive maintenance" });
    }
  }
  downtime.sort((x, y) => y.start.localeCompare(x.start));
  return {
    companyName: COMPANY_NAME,
    anchorDate: toIso(today),
    warehouses: WAREHOUSES,
    suppliers,
    items,
    assets,
    inspections,
    purchaseOrders,
    invoices,
    downtime
  };
}

// src/demo/retail/generate.ts
var NSKU = 5e3;
var DAY2 = 864e5;
var SEED2 = 73102026;
function h(a, b = 0, c = 0) {
  let x = Math.imul(a ^ 2654435769, 2246822507) ^ Math.imul(b + 1663821227, 3266489909) ^ Math.imul(c + 668265263, 374761393);
  x ^= x >>> 15;
  x = Math.imul(x, 739982445);
  x ^= x >>> 12;
  x = Math.imul(x, 695872825);
  x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
var iso = (d) => d.toISOString().slice(0, 10);
var addDaysIso = (base, n) => iso(new Date((/* @__PURE__ */ new Date(base + "T00:00:00Z")).getTime() + n * DAY2));
var COUNTRIES = [
  { code: "AE", name: "United Arab Emirates", currency: "AED", toAed: 1, vat: 0.05, regions: ["Dubai", "Abu Dhabi", "Sharjah & Northern Emirates"] },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", toAed: 0.979, vat: 0.15, regions: ["Riyadh", "Makkah Region", "Eastern Province"] },
  { code: "QA", name: "Qatar", currency: "QAR", toAed: 1.009, vat: 0, regions: ["Doha"] },
  { code: "KW", name: "Kuwait", currency: "KWD", toAed: 11.95, vat: 0, regions: ["Kuwait City", "Hawalli"] },
  { code: "OM", name: "Oman", currency: "OMR", toAed: 9.54, vat: 0.05, regions: ["Muscat", "Sohar"] },
  { code: "BH", name: "Bahrain", currency: "BHD", toAed: 9.74, vat: 0.1, regions: ["Capital", "Muharraq"] }
];
var STORE_DEFS = [
  ["Dubai Marina", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Al Barsha", "AE", "Dubai", "Dubai", "Hypermarket", 0],
  ["Deira City Centre", "AE", "Dubai", "Dubai", "Hypermarket", 0],
  ["Mirdif", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Jumeirah Lakes Towers", "AE", "Dubai", "Dubai", "Express", 0],
  ["Business Bay", "AE", "Dubai", "Dubai", "Express", 0],
  ["Silicon Oasis", "AE", "Dubai", "Dubai", "Supermarket", 0],
  ["Corniche", "AE", "Abu Dhabi", "Abu Dhabi", "Supermarket", 0],
  ["Khalifa City", "AE", "Abu Dhabi", "Abu Dhabi", "Hypermarket", 0],
  ["Al Reem Island", "AE", "Abu Dhabi", "Abu Dhabi", "Express", 0],
  ["Al Ain Central", "AE", "Abu Dhabi", "Al Ain", "Hypermarket", 0],
  ["Sharjah Al Nahda", "AE", "Sharjah & Northern Emirates", "Sharjah", "Hypermarket", 0],
  ["Sharjah Al Majaz", "AE", "Sharjah & Northern Emirates", "Sharjah", "Supermarket", 0],
  ["Ajman Corniche", "AE", "Sharjah & Northern Emirates", "Ajman", "Supermarket", 0],
  ["Ras Al Khaimah", "AE", "Sharjah & Northern Emirates", "Ras Al Khaimah", "Hypermarket", 0],
  ["Fujairah City", "AE", "Sharjah & Northern Emirates", "Fujairah", "Supermarket", 0],
  ["Riyadh Olaya", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Riyadh Al Malaz", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Riyadh Al Nakheel", "SA", "Riyadh", "Riyadh", "Supermarket", 1],
  ["Riyadh Al Yasmin", "SA", "Riyadh", "Riyadh", "Supermarket", 1],
  ["Riyadh King Fahd Rd", "SA", "Riyadh", "Riyadh", "Express", 1],
  ["Riyadh Al Suwaidi", "SA", "Riyadh", "Riyadh", "Hypermarket", 1],
  ["Jeddah Tahlia", "SA", "Makkah Region", "Jeddah", "Hypermarket", 2],
  ["Jeddah Al Rawdah", "SA", "Makkah Region", "Jeddah", "Supermarket", 2],
  ["Jeddah Corniche", "SA", "Makkah Region", "Jeddah", "Express", 2],
  ["Makkah Al Aziziyah", "SA", "Makkah Region", "Makkah", "Hypermarket", 2],
  ["Taif Central", "SA", "Makkah Region", "Taif", "Supermarket", 2],
  ["Madinah Quba", "SA", "Makkah Region", "Madinah", "Supermarket", 2],
  ["Dammam Al Faisaliyah", "SA", "Eastern Province", "Dammam", "Hypermarket", 3],
  ["Khobar Corniche", "SA", "Eastern Province", "Al Khobar", "Supermarket", 3],
  ["Dhahran Mall", "SA", "Eastern Province", "Dhahran", "Supermarket", 3],
  ["Jubail Industrial", "SA", "Eastern Province", "Jubail", "Supermarket", 3],
  ["Al Ahsa Hofuf", "SA", "Eastern Province", "Hofuf", "Hypermarket", 3],
  ["Qatif Central", "SA", "Eastern Province", "Qatif", "Express", 3],
  ["Doha West Bay", "QA", "Doha", "Doha", "Hypermarket", 4],
  ["Doha Al Sadd", "QA", "Doha", "Doha", "Supermarket", 4],
  ["The Pearl", "QA", "Doha", "Doha", "Express", 4],
  ["Al Wakrah", "QA", "Doha", "Al Wakrah", "Supermarket", 4],
  ["Lusail", "QA", "Doha", "Lusail", "Supermarket", 4],
  ["Kuwait City Sharq", "KW", "Kuwait City", "Kuwait City", "Hypermarket", 5],
  ["Salmiya", "KW", "Hawalli", "Salmiya", "Supermarket", 5],
  ["Hawalli Central", "KW", "Hawalli", "Hawalli", "Supermarket", 5],
  ["Fahaheel", "KW", "Kuwait City", "Fahaheel", "Express", 5],
  ["Muscat Qurum", "OM", "Muscat", "Muscat", "Hypermarket", 0],
  ["Muscat Al Khuwair", "OM", "Muscat", "Muscat", "Supermarket", 0],
  ["Seeb", "OM", "Muscat", "Seeb", "Supermarket", 0],
  ["Sohar Central", "OM", "Sohar", "Sohar", "Supermarket", 0],
  ["Manama Seef", "BH", "Capital", "Manama", "Hypermarket", 3],
  ["Juffair", "BH", "Capital", "Manama", "Express", 3],
  ["Muharraq", "BH", "Muharraq", "Muharraq", "Supermarket", 3]
];
var DCS = [
  ["Jebel Ali DC", "AE"],
  ["Riyadh DC", "SA"],
  ["Jeddah DC", "SA"],
  ["Dammam DC", "SA"],
  ["Doha DC", "QA"],
  ["Kuwait DC", "KW"]
];
var S = (dept, cat, sub, icon, products, sizes, price, rate, shelf, extra = {}) => ({
  dept,
  cat,
  sub,
  icon,
  products,
  sizes,
  price,
  rate,
  shelf,
  ...extra
});
var CATALOG = [
  S("Fresh Food", "Fruits & Vegetables", "Fruits", "\u{1F34E}", ["Apples", "Bananas", "Oranges", "Grapes", "Mangoes", "Dates"], [["per kg", "kg", 1]], [5, 28], [6, 22], 10, { variants: ["Red", "Green", "Premium", "Organic"] }),
  S("Fresh Food", "Fruits & Vegetables", "Vegetables", "\u{1F96C}", ["Tomatoes", "Cucumbers", "Potatoes", "Onions", "Lettuce", "Carrots"], [["per kg", "kg", 1]], [3, 14], [8, 30], 8, { variants: ["Local", "Imported", "Organic"] }),
  S("Fresh Food", "Dairy & Eggs", "Milk", "\u{1F95B}", ["Fresh Milk", "Laban", "Flavoured Milk"], [["1 L", "piece", 1], ["2 L", "piece", 1]], [4, 12], [6, 25], 7, { variants: ["Full Fat", "Low Fat", "Skimmed"] }),
  S("Fresh Food", "Dairy & Eggs", "Yoghurt & Cheese", "\u{1F9C0}", ["Greek Yoghurt", "Labneh", "Halloumi", "Cheddar Slices", "Feta"], [["170 g", "piece", 1], ["400 g", "piece", 1]], [5, 26], [2, 10], 21),
  S("Fresh Food", "Dairy & Eggs", "Eggs", "\u{1F95A}", ["Eggs"], [["Tray 30", "piece", 1], ["Pack 15", "piece", 1]], [12, 28], [3, 10], 28, { variants: ["White", "Brown", "Organic"] }),
  S("Fresh Food", "Bakery", "Bread", "\u{1F35E}", ["Arabic Bread", "White Toast", "Brown Toast", "Croissants", "Samoon"], [["Pack", "piece", 1]], [3, 14], [5, 20], 4),
  S("Fresh Food", "Meat & Poultry", "Poultry", "\u{1F357}", ["Fresh Chicken Whole", "Chicken Breast", "Chicken Thighs"], [["per kg", "kg", 1]], [16, 38], [3, 14], 5),
  S("Fresh Food", "Meat & Poultry", "Meat", "\u{1F969}", ["Lamb Chops", "Beef Mince", "Veal Cubes"], [["per kg", "kg", 1]], [35, 85], [1, 6], 5),
  S("Grocery", "Staples", "Rice & Grains", "\u{1F35A}", ["Basmati Rice", "Sella Rice", "Calrose Rice", "Bulgur", "Lentils"], [["1 kg", "piece", 1], ["5 kg", "piece", 1], ["10 kg", "piece", 1]], [6, 75], [1, 8], 540),
  S("Grocery", "Staples", "Cooking Oil", "\u{1FAD2}", ["Sunflower Oil", "Olive Oil", "Corn Oil", "Ghee"], [["1 L", "litre", 1], ["1.8 L", "litre", 1], ["750 ml", "litre", 1]], [8, 45], [1, 6], 365),
  S("Grocery", "Staples", "Flour & Sugar", "\u{1F33E}", ["Plain Flour", "Whole Wheat Atta", "White Sugar", "Brown Sugar"], [["1 kg", "piece", 1], ["2 kg", "piece", 1], ["5 kg", "piece", 1]], [4, 30], [1, 6], 365),
  S("Grocery", "Beverages", "Water", "\u{1F4A7}", ["Mineral Water", "Sparkling Water"], [["500 ml x 12", "pack", 1], ["1.5 L x 6", "pack", 1]], [5, 16], [6, 24], 365),
  S("Grocery", "Beverages", "Juices & Soft Drinks", "\u{1F9C3}", ["Orange Juice", "Mango Nectar", "Cola", "Lemon Soda", "Iced Tea"], [["250 ml", "piece", 1], ["1 L", "piece", 1], ["330 ml x 6", "pack", 1]], [2, 18], [3, 16], 180),
  S("Grocery", "Beverages", "Tea & Coffee", "\u2615", ["Black Tea", "Green Tea", "Arabic Coffee", "Instant Coffee", "Coffee Beans"], [["100 g", "piece", 1], ["250 g", "piece", 1], ["500 g", "piece", 1]], [8, 65], [1, 5], 540),
  S("Grocery", "Snacks & Confectionery", "Snacks", "\u{1F968}", ["Potato Chips", "Mixed Nuts", "Popcorn", "Crackers", "Cookies"], [["45 g", "piece", 1], ["150 g", "piece", 1], ["300 g", "piece", 1]], [2, 24], [2, 12], 240),
  S("Grocery", "Snacks & Confectionery", "Chocolate & Sweets", "\u{1F36B}", ["Milk Chocolate", "Dark Chocolate", "Maamoul", "Halwa", "Gummies"], [["50 g", "piece", 1], ["200 g", "piece", 1]], [3, 32], [1, 9], 300),
  S("Grocery", "Canned & Packaged", "Canned Food", "\u{1F96B}", ["Tuna", "Chickpeas", "Foul Medames", "Tomato Paste", "Sweet Corn"], [["185 g", "piece", 1], ["400 g", "piece", 1]], [3, 14], [1, 7], 720),
  S("Grocery", "Canned & Packaged", "Pasta & Noodles", "\u{1F35D}", ["Spaghetti", "Penne", "Instant Noodles", "Vermicelli"], [["400 g", "piece", 1], ["5 x 75 g", "pack", 1]], [3, 12], [1, 8], 540),
  S("Frozen", "Frozen Food", "Frozen Ready Meals", "\u{1F9CA}", ["Frozen Pizza", "Chicken Nuggets", "Frozen Samosa", "Spring Rolls", "Frozen Paratha"], [["400 g", "piece", 1], ["1 kg", "piece", 1]], [8, 38], [1, 6], 180),
  S("Frozen", "Frozen Food", "Ice Cream", "\u{1F366}", ["Vanilla Ice Cream", "Chocolate Ice Cream", "Mango Kulfi", "Ice Cream Cones"], [["1 L", "piece", 1], ["4 x 100 ml", "pack", 1]], [6, 28], [1, 7], 270),
  S("Household", "Cleaning", "Laundry", "\u{1F9FA}", ["Laundry Powder", "Liquid Detergent", "Fabric Softener"], [["1 kg", "piece", 1], ["3 L", "piece", 1], ["5 kg", "piece", 1]], [10, 70], [0.6, 4], null),
  S("Household", "Cleaning", "Surface Care", "\u{1F9FD}", ["Dishwashing Liquid", "Floor Cleaner", "Glass Cleaner", "Bleach"], [["500 ml", "piece", 1], ["1 L", "piece", 1]], [4, 22], [0.8, 5], null),
  S("Household", "Paper & Disposables", "Paper", "\u{1F9FB}", ["Toilet Tissue", "Kitchen Towels", "Facial Tissues"], [["Pack 6", "pack", 1], ["Pack 12", "pack", 1]], [6, 32], [1, 6], null),
  S("Household", "Paper & Disposables", "Disposables", "\u{1F964}", ["Paper Cups", "Aluminium Foil", "Cling Film", "Garbage Bags"], [["Pack", "pack", 1]], [4, 20], [0.5, 3], null),
  S("Personal Care", "Hair & Body", "Hair Care", "\u{1F9F4}", ["Shampoo", "Conditioner", "Hair Oil"], [["200 ml", "piece", 1], ["400 ml", "piece", 1]], [9, 38], [0.4, 3], null, { variants: ["Anti-Dandruff", "Repair", "Smooth", "Herbal"] }),
  S("Personal Care", "Hair & Body", "Body Care", "\u{1F9FC}", ["Body Wash", "Bar Soap", "Body Lotion", "Deodorant"], [["150 ml", "piece", 1], ["250 ml", "piece", 1], ["4 x 120 g", "pack", 1]], [5, 34], [0.5, 4], null),
  S("Personal Care", "Oral & Health", "Oral Care", "\u{1FAA5}", ["Toothpaste", "Toothbrush", "Mouthwash"], [["100 ml", "piece", 1], ["Twin pack", "pack", 1]], [5, 26], [0.5, 3], null),
  S("Baby", "Baby Care", "Diapers & Wipes", "\u{1F37C}", ["Diapers Size 3", "Diapers Size 4", "Diapers Size 5", "Baby Wipes"], [["Pack 40", "pack", 1], ["Pack 64", "pack", 1]], [18, 75], [0.4, 2.5], null),
  S("Baby", "Baby Care", "Baby Food", "\u{1F963}", ["Infant Formula Stage 1", "Infant Formula Stage 2", "Baby Cereal"], [["400 g", "piece", 1], ["900 g", "piece", 1]], [25, 120], [0.2, 1.5], 365),
  S("Electronics", "Mobile & Accessories", "Accessories", "\u{1F50C}", ["USB-C Cable", "Fast Charger 25W", "Power Bank 10000mAh", "Wireless Earbuds", "Phone Case"], [["Unit", "piece", 1]], [15, 220], [0.05, 0.6], null, { colours: ["Black", "White", "Blue"], serialized: false }),
  S("Electronics", "Small Appliances", "Kitchen Appliances", "\u{1F50C}", ["Electric Kettle", "Blender", "Air Fryer", "Toaster", "Coffee Maker"], [["Unit", "piece", 1]], [60, 480], [0.02, 0.25], null, { colours: ["Black", "Silver", "White"], serialized: true }),
  S("Home & Living", "Kitchenware", "Cookware", "\u{1F373}", ["Non-stick Pan", "Cooking Pot", "Knife Set", "Food Containers"], [["Unit", "piece", 1], ["Set", "piece", 1]], [18, 160], [0.05, 0.5], null, { colours: ["Black", "Red", "Grey"] }),
  S("Home & Living", "Home Textiles", "Textiles", "\u{1F6CF}\uFE0F", ["Bath Towel", "Bedsheet Set", "Cushion Cover", "Prayer Mat"], [["Unit", "piece", 1]], [15, 140], [0.05, 0.5], null, { colours: ["White", "Beige", "Navy", "Grey"] })
];
var BRANDS_BY_CATEGORY = {
  "Fruits & Vegetables": ["Gulf Fresh", "Oasis Farms", "Palm Valley", "Arabian Harvest", "Green Crescent"],
  "Dairy & Eggs": ["Desert Dairy", "Gulf Fresh", "Oasis Farms", "Green Crescent"],
  Bakery: ["Al Waha Bakery", "Palm Valley", "Gulf Fresh"],
  "Meat & Poultry": ["Najd Poultry", "Arabian Harvest", "Green Crescent"]
};
var BRANDS = {
  "Fresh Food": ["Gulf Fresh", "Oasis Farms", "Palm Valley", "Desert Dairy", "Al Waha Bakery", "Arabian Harvest", "Najd Poultry", "Green Crescent"],
  Grocery: ["Sahara Gold", "Pearl Pantry", "Bayt", "Falcon", "Zahra", "Noura", "Golden Dune", "Al Majd"],
  Frozen: ["Polar Gulf", "Frosty Dunes", "Bayt Frozen", "Arctic Palm"],
  Household: ["Marina Home", "CleanWave", "Bayt Care", "Sparkle", "Najma"],
  "Personal Care": ["Desert Bloom", "Lumi\xE8re", "Pure Oasis", "Amber", "Silk Road"],
  Baby: ["Little Pearl", "Nunu", "BabyNest"],
  Electronics: ["TechNest", "Lumo", "Voltix", "Kitchenly"],
  "Home & Living": ["Bayt Living", "Casa Gulf", "Marina Home", "Dar"]
};
function ean13(seed) {
  const digits = [6, 2, 9];
  for (let i = 0; i < 9; i++) digits.push(Math.floor(h(seed, i, 99) * 10));
  const sum3 = digits.reduce((s, d, i) => s + d * (i % 2 ? 3 : 1), 0);
  digits.push((10 - sum3 % 10) % 10);
  return digits.join("");
}
function upcA(seed) {
  const digits = [0];
  for (let i = 0; i < 10; i++) digits.push(Math.floor(h(seed, i, 98) * 10));
  const sum3 = digits.reduce((s, d, i) => s + d * (i % 2 ? 1 : 3), 0);
  digits.push((10 - sum3 % 10) % 10);
  return digits.join("");
}
var GCC_ORIGINS = /* @__PURE__ */ new Set(["UAE", "Saudi Arabia", "Oman", "Qatar", "Kuwait", "Bahrain"]);
var PACKAGING = {
  Fruits: "Loose / crate",
  Vegetables: "Loose / crate",
  Milk: "Bottle",
  "Yoghurt & Cheese": "Tub",
  Eggs: "Tray",
  Bread: "Bag",
  Poultry: "Tray (MAP)",
  Meat: "Vacuum pack",
  "Rice & Grains": "Bag",
  "Cooking Oil": "Bottle",
  "Flour & Sugar": "Bag",
  Water: "Shrink-wrapped multipack",
  "Juices & Soft Drinks": "Bottle / can",
  "Tea & Coffee": "Box / jar",
  Snacks: "Pouch",
  "Chocolate & Sweets": "Wrapper / box",
  "Canned Food": "Can",
  "Pasta & Noodles": "Bag",
  "Frozen Ready Meals": "Box",
  "Ice Cream": "Tub",
  Laundry: "Box / bottle",
  "Surface Care": "Bottle",
  Paper: "Shrink-wrapped pack",
  Disposables: "Box",
  "Hair Care": "Bottle",
  "Body Care": "Bottle / bar"
};
var FLAVOURED = /* @__PURE__ */ new Set(["Juices & Soft Drinks", "Ice Cream", "Snacks", "Chocolate & Sweets", "Milk", "Yoghurt & Cheese", "Tea & Coffee"]);
var FLAVOUR_WORDS = ["Orange", "Mango", "Cola", "Lemon", "Vanilla", "Dark Chocolate", "Milk Chocolate", "Chocolate", "Green Tea", "Black Tea"];
function flavourFor(sub, product, k) {
  if (!FLAVOURED.has(sub)) return null;
  const hit = FLAVOUR_WORDS.find((w) => product.includes(w));
  if (hit) return hit;
  const opts = sub === "Snacks" ? ["Salted", "Cheese", "Chilli", "Sour Cream"] : sub === "Milk" ? ["Plain", "Strawberry", "Chocolate", "Banana"] : ["Original", "Strawberry", "Honey"];
  return opts[Math.floor(h(k, 41) * opts.length)];
}
function lifecycleFor(status, k) {
  if (status === "Discontinued") return "End of life";
  if (status === "New") return "Introduction";
  const r = h(k, 42);
  return r < 0.22 ? "Growth" : r < 0.88 ? "Maturity" : "Decline";
}
var RETAIL_CALENDAR = [
  { id: "CAL-RAM26", name: "Ramadan 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-02-18", end: "2026-03-19", uplift: { Grocery: 0.38, "Fresh Food": 0.3, Frozen: 0.22, Household: 0.12 } },
  { id: "CAL-EIDF26", name: "Eid al-Fitr 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-03-20", end: "2026-03-23", uplift: { "Fresh Food": 0.25, Grocery: 0.2, "Personal Care": 0.3, Electronics: 0.25 } },
  { id: "CAL-EIDA26", name: "Eid al-Adha 2026", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-05-26", end: "2026-05-29", uplift: { "Fresh Food": 0.45, Grocery: 0.18 } },
  { id: "CAL-BTS26", name: "Back to School 2026", kind: "Seasonal", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-08-17", end: "2026-09-06", uplift: { Electronics: 0.35, Grocery: 0.08 } },
  { id: "CAL-SND26", name: "Saudi National Day 2026", kind: "National", countries: ["SA"], start: "2026-09-21", end: "2026-09-24", uplift: { Grocery: 0.15, Electronics: 0.3 } },
  { id: "CAL-WF26", name: "White Friday 2026", kind: "Promotion", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2026-11-25", end: "2026-11-30", uplift: { Electronics: 0.85, "Home & Living": 0.45, "Personal Care": 0.25, Household: 0.2 } },
  { id: "CAL-UND26", name: "UAE National Day 2026", kind: "National", countries: ["AE"], start: "2026-12-01", end: "2026-12-03", uplift: { Grocery: 0.18, "Fresh Food": 0.15 } },
  { id: "CAL-DSF26", name: "Dubai Shopping Festival 2026-27", kind: "Promotion", countries: ["AE"], start: "2026-12-11", end: "2027-01-10", uplift: { Electronics: 0.4, "Home & Living": 0.3, "Personal Care": 0.15 } },
  { id: "CAL-BND26", name: "Bahrain National Day 2026", kind: "National", countries: ["BH"], start: "2026-12-16", end: "2026-12-17", uplift: { Grocery: 0.15 } },
  { id: "CAL-QND26", name: "Qatar National Day 2026", kind: "National", countries: ["QA"], start: "2026-12-18", end: "2026-12-18", uplift: { Grocery: 0.15 } },
  { id: "CAL-RAM27", name: "Ramadan 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-02-08", end: "2027-03-09", uplift: { Grocery: 0.38, "Fresh Food": 0.3, Frozen: 0.22, Household: 0.12 } },
  { id: "CAL-EIDF27", name: "Eid al-Fitr 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-03-10", end: "2027-03-13", uplift: { "Fresh Food": 0.25, Grocery: 0.2, "Personal Care": 0.3, Electronics: 0.25 } },
  { id: "CAL-EIDA27", name: "Eid al-Adha 2027", kind: "Religious", countries: ["AE", "SA", "QA", "KW", "OM", "BH"], start: "2027-05-16", end: "2027-05-19", uplift: { "Fresh Food": 0.45, Grocery: 0.18 } }
];
var CARRIERS = ["GulfLink 3PL", "Desert Freight Logistics", "Oasis Cold Chain 3PL", "Peninsula Haulage", "Crescent Logistics"];
function productMaster(k, sub, product, brand, baseUom, sizeLabel, cost, origin, statusR) {
  const uoms = uomsFor(baseUom, sizeLabel);
  const caseU = uoms.find((u) => u.uom === "case") ?? uoms.find((u) => u.uom === "carton");
  const casePack = caseU ? Math.round(caseU.factor * 1e3) / 1e3 : 1;
  const imported = !GCC_ORIGINS.has(origin);
  const landedCost = Math.round(cost * (imported ? 1.08 + h(k, 43) * 0.05 : 1.01 + h(k, 43) * 0.015) * 100) / 100;
  let spuHash = 0;
  for (const ch of `${brand}|${product}`) spuHash = (spuHash * 31 + ch.charCodeAt(0)) % 9e6;
  const status = statusR < 0.03 ? "Discontinued" : statusR < 0.08 ? "New" : statusR < 0.12 ? "Seasonal" : "Active";
  return {
    ean: ean13(k + 17),
    upc: origin === "Singapore" || h(k, 44) < 0.06 ? upcA(k + 5) : null,
    spu: `SPU-${String(1e6 + spuHash).slice(-7)}`,
    flavour: flavourFor(sub, product, k),
    packaging: PACKAGING[sub] ?? "Box",
    lifecycle: lifecycleFor(status, k),
    casePack,
    moq: Math.round(casePack * (1 + Math.floor(h(k, 45) * 3)) * 1e3) / 1e3,
    landedCost,
    mrp: origin === "India" ? Math.round(landedCost * 1.62 * 100) / 100 : null
  };
}
function uomsFor(base, sizeLabel) {
  if (base === "kg") return [
    { uom: "kg", factor: 1, label: "Kilogram" },
    { uom: "g", factor: 1e-3, label: "Gram" },
    { uom: "case", factor: 10, label: "Case (10 kg)" },
    { uom: "pallet", factor: 400, label: "Pallet (40 cases)" }
  ];
  if (base === "litre") {
    const m = sizeLabel.match(/([\d.]+)\s*(ml|L)/i);
    const litres = m ? m[2].toLowerCase() === "ml" ? Number(m[1]) / 1e3 : Number(m[1]) : 1;
    return [
      { uom: "litre", factor: 1, label: "Litre" },
      { uom: "ml", factor: 1e-3, label: "Millilitre" },
      { uom: "piece", factor: litres, label: `Bottle (${sizeLabel})` },
      { uom: "carton", factor: litres * 12, label: "Carton (12 bottles)" },
      { uom: "pallet", factor: litres * 12 * 60, label: "Pallet (60 cartons)" }
    ];
  }
  const caseQty = base === "pack" ? 6 : 24;
  return [
    { uom: base, factor: 1, label: base === "pack" ? "Pack" : "Piece" },
    { uom: "carton", factor: caseQty / 2, label: `Carton (${caseQty / 2})` },
    { uom: "case", factor: caseQty, label: `Case (${caseQty})` },
    { uom: "pallet", factor: caseQty * 50, label: `Pallet (50 cases)` }
  ];
}
var SUPPLIER_NAMES = [
  "Emirates Fresh Produce",
  "Gulf Dairy Industries",
  "Arabian Food Distributors",
  "Najd Agricultural Co.",
  "Al Khaleej Bakeries",
  "Red Sea Poultry",
  "Pearl Trading LLC",
  "Sahara Food Industries",
  "Falcon Beverages",
  "Oasis Water Co.",
  "Golden Grains Trading",
  "Levant Imports",
  "Nile Valley Foods",
  "Indus Rice Exports",
  "Anatolia Snacks",
  "Mediterranean Oils",
  "Polar Frozen Foods",
  "Arctic Cold Chain Trading",
  "CleanWave Industries",
  "Bayt Household Supplies",
  "Desert Bloom Cosmetics",
  "Silk Road Personal Care",
  "Little Pearl Baby Products",
  "Gulf Paper Mills",
  "TechNest Distribution",
  "Voltix Electronics FZE",
  "Kitchenly Appliances",
  "Casa Gulf Home",
  "Dar Textiles",
  "Asia Pacific Trading",
  "Al Majd Wholesale",
  "Zahra Foods",
  "Noura Trading",
  "Muscat Foodstuff",
  "Doha Fresh Supplies",
  "Kuwait Food Co.",
  "Bahrain Distribution Hub",
  "Jeddah Import House",
  "Eastern Province Traders",
  "Global Brands FZCO"
];
var SUPPLIER_COUNTRY = ["UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "Jordan", "Egypt", "India", "T\xFCrkiye", "Spain", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "UAE", "UAE", "Saudi Arabia", "UAE", "UAE", "UAE", "UAE", "T\xFCrkiye", "Singapore", "Saudi Arabia", "UAE", "Kuwait", "Oman", "Qatar", "Kuwait", "Bahrain", "Saudi Arabia", "Saudi Arabia", "UAE"];
var SUPPLIER_CATS = [
  ["Fruits & Vegetables"],
  ["Dairy & Eggs"],
  ["Staples", "Canned & Packaged"],
  ["Fruits & Vegetables", "Dairy & Eggs"],
  ["Bakery"],
  ["Meat & Poultry"],
  ["Beverages", "Snacks & Confectionery"],
  ["Staples", "Canned & Packaged"],
  ["Beverages"],
  ["Beverages"],
  ["Staples"],
  ["Canned & Packaged", "Snacks & Confectionery"],
  ["Canned & Packaged"],
  ["Staples"],
  ["Snacks & Confectionery"],
  ["Staples"],
  ["Frozen Food"],
  ["Frozen Food", "Meat & Poultry"],
  ["Cleaning"],
  ["Cleaning", "Paper & Disposables"],
  ["Hair & Body"],
  ["Hair & Body", "Oral & Health"],
  ["Baby Care"],
  ["Paper & Disposables"],
  ["Mobile & Accessories"],
  ["Mobile & Accessories", "Small Appliances"],
  ["Small Appliances"],
  ["Kitchenware"],
  ["Home Textiles"],
  ["Kitchenware", "Home Textiles", "Mobile & Accessories"],
  ["Staples", "Beverages"],
  ["Snacks & Confectionery", "Staples"],
  ["Canned & Packaged", "Beverages"],
  ["Fruits & Vegetables", "Dairy & Eggs"],
  ["Fruits & Vegetables", "Bakery"],
  ["Staples", "Dairy & Eggs"],
  ["Cleaning", "Paper & Disposables"],
  ["Frozen Food", "Canned & Packaged"],
  ["Meat & Poultry", "Bakery"],
  ["Hair & Body", "Baby Care", "Oral & Health"]
];
var LATE_SUPPLIERS = [1, 16, 25];
var FIRST = ["Ahmed", "Fatima", "Omar", "Aisha", "Khalid", "Mariam", "Yousef", "Noura", "Hassan", "Layla", "Rashid", "Sara", "Faisal", "Huda", "Tariq", "Reem", "Imran", "Priya", "Joseph", "Anil"];
var LAST = ["Al Mansoori", "Al Qahtani", "Haddad", "Al Shamsi", "Rahman", "Al Harbi", "Nasser", "Al Kuwari", "Saleh", "Al Balushi", "Khan", "Menon", "Fernandes", "Al Dosari", "Yousif"];
var TECHNICIANS = ["Ravi Kumar (Cold chain)", "Mohammed Saeed (HVAC)", "Arjun Nair (Refrigeration)", "Bilal Ahmed (Electrical)", "Elena Cruz (POS & IT)", "Samir Haddad (Generators)"];
var person = (a, b) => `${FIRST[Math.floor(h(a, b, 1) * FIRST.length)]} ${LAST[Math.floor(h(a, b, 2) * LAST.length)]}`;
var FORMAT_FACTOR = { Hypermarket: 1.7, Supermarket: 1, Express: 0.42 };
var FORMAT_RANGE = { Hypermarket: 0.96, Supermarket: 0.72, Express: 0.34 };
function generateRetail(anchor = /* @__PURE__ */ new Date()) {
  const rng = createRng(SEED2);
  const today = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth(), anchor.getUTCDate()));
  const anchorDate = iso(today);
  const stores = STORE_DEFS.map(([name, country, region, city, format, dcIdx], idx) => {
    const sizeSqm = format === "Hypermarket" ? rng.int(8e3, 14e3) : format === "Supermarket" ? rng.int(1800, 4500) : rng.int(350, 900);
    const traffic = FORMAT_FACTOR[format] * rng.range(0.82, 1.22);
    return { idx, id: `S${101 + idx}`, name, country, region, city, format, sizeSqm, manager: person(idx, 7), opened: rng.int(2009, 2023), traffic, dcIdx, monthlyTargetAed: 0 };
  });
  const dcs = DCS.map(([name, country], idx) => ({ idx, id: `DC${idx + 1}`, name, country }));
  const suppliers = SUPPLIER_NAMES.map((name, idx) => ({
    idx,
    id: `SUP-${String(idx + 1).padStart(3, "0")}`,
    name,
    country: SUPPLIER_COUNTRY[idx],
    categories: SUPPLIER_CATS[idx],
    leadTimeDays: SUPPLIER_CATS[idx].some((c) => ["Fruits & Vegetables", "Dairy & Eggs", "Bakery", "Meat & Poultry"].includes(c)) ? rng.int(1, 3) : rng.int(5, 21),
    onTimeTarget: LATE_SUPPLIERS.includes(idx) ? rng.range(0.35, 0.55) : rng.range(0.82, 0.98),
    fillTarget: LATE_SUPPLIERS.includes(idx) ? rng.range(0.72, 0.85) : rng.range(0.9, 0.995),
    contact: person(idx, 33)
  }));
  const suppliersByCat = /* @__PURE__ */ new Map();
  suppliers.forEach((s) => s.categories.forEach((c) => suppliersByCat.set(c, [...suppliersByCat.get(c) ?? [], s.idx])));
  const skus = [];
  let round2 = 0;
  while (skus.length < NSKU) {
    for (let si = 0; si < CATALOG.length && skus.length < NSKU; si++) {
      const d = CATALOG[si];
      const brands = BRANDS_BY_CATEGORY[d.cat] ?? BRANDS[d.dept];
      const pIdx = (round2 + si) % d.products.length;
      const bIdx = Math.floor(round2 / d.products.length + si) % brands.length;
      const sizeIdx = Math.floor(round2 / (d.products.length * brands.length)) % d.sizes.length;
      const variants = d.variants ?? [];
      const vIdx = variants.length ? Math.floor(round2 / 3) % variants.length : -1;
      const colours = d.colours ?? [];
      const colour = colours.length ? colours[round2 % colours.length] : null;
      const [sizeLabel, baseUom] = d.sizes[sizeIdx];
      const k = skus.length;
      const variant = vIdx >= 0 ? variants[vIdx] : "Regular";
      const cost = Math.round(rng.range(d.price[0], d.price[1]) * 0.72 * 100) / 100;
      const markup = d.dept === "Fresh Food" ? rng.range(1.22, 1.45) : d.dept === "Electronics" ? rng.range(1.18, 1.35) : rng.range(1.25, 1.6);
      const cats = suppliersByCat.get(d.cat) ?? [0];
      const supplierIdx = cats[Math.floor(h(k, 5) * cats.length)];
      const alt = cats.filter((c) => c !== supplierIdx);
      const statusR = h(k, 6);
      skus.push({
        idx: k,
        id: `SKU-${100001 + k}`,
        name: `${brands[bIdx]} ${d.products[pIdx]}${vIdx >= 0 && variant !== "Regular" ? " " + variant : ""}${colour ? " " + colour : ""} ${sizeLabel}`,
        brand: brands[bIdx],
        department: d.dept,
        category: d.cat,
        subcategory: d.sub,
        variant,
        size: sizeLabel,
        colour,
        gtin: ean13(k + 17),
        baseUom,
        uoms: uomsFor(baseUom, sizeLabel),
        cost,
        price: Math.round(cost * markup * 100) / 100,
        status: statusR < 0.03 ? "Discontinued" : statusR < 0.08 ? "New" : statusR < 0.12 ? "Seasonal" : "Active",
        perishable: d.shelf !== null && d.shelf <= 30,
        shelfLifeDays: d.shelf,
        serialized: !!d.serialized,
        supplierIdx,
        altSupplierIdx: alt.length ? alt[Math.floor(h(k, 8) * alt.length)] : suppliersByCat.get(d.cat)?.[0] ?? 0,
        // long-tail popularity
        baseRate: rng.range(d.rate[0], d.rate[1]) * Math.pow(h(k, 9) + 0.15, 1.6),
        icon: d.icon,
        ...productMaster(k, d.sub, d.products[pIdx], brands[bIdx], baseUom, sizeLabel, cost, SUPPLIER_COUNTRY[supplierIdx] ?? "UAE", statusR)
      });
    }
    round2++;
  }
  const N = stores.length * NSKU;
  const carried = new Uint8Array(N);
  const onHand = new Int32Array(N);
  const reserved = new Int32Array(N);
  const damaged = new Int32Array(N);
  const velocity = new Float32Array(N);
  const lastSaleDaysAgo = new Uint8Array(N);
  const S118 = 17;
  for (const st of stores) {
    for (let k = 0; k < NSKU; k++) {
      const sku = skus[k];
      const p = st.idx * NSKU + k;
      let range = FORMAT_RANGE[st.format];
      if (sku.department === "Electronics" || sku.department === "Home & Living") range *= st.format === "Express" ? 0.15 : 0.85;
      if (sku.status === "Discontinued") range *= 0.6;
      if (h(st.idx, k, 1) > range) continue;
      carried[p] = 1;
      const v2 = sku.baseRate * st.traffic * (0.55 + h(st.idx, k, 2) * 0.9);
      velocity[p] = v2;
      const r = h(st.idx, k, 3);
      const fast = sku.baseRate > 2.5;
      const stockoutP = st.idx === S118 && fast ? 0.16 : 9e-3;
      let oh;
      let last = v2 >= 1 ? 0 : Math.min(30, Math.floor(h(st.idx, k, 4) * (1 / Math.max(v2, 0.04))));
      if (r < stockoutP) {
        oh = 0;
        last = 1 + Math.floor(h(st.idx, k, 5) * 5);
      } else if (r < stockoutP + 0.025) oh = Math.floor(v2 * (0.3 + h(st.idx, k, 6) * 2.2));
      else if (r < stockoutP + 0.031 && v2 >= 1) {
        oh = Math.ceil(v2 * (6 + h(st.idx, k, 7) * 10));
        last = 6 + Math.floor(h(st.idx, k, 8) * 9);
      } else if (r < stockoutP + 0.046) oh = Math.ceil(Math.max(6, v2 * (110 + h(st.idx, k, 9) * 150)));
      else oh = Math.ceil(v2 * (8 + h(st.idx, k, 10) * 22));
      if (sku.baseUom === "kg") oh = Math.round(oh);
      onHand[p] = oh;
      lastSaleDaysAgo[p] = last;
      if (h(st.idx, k, 11) < 0.04) reserved[p] = Math.min(oh, 1 + Math.floor(h(st.idx, k, 12) * 4));
      if (h(st.idx, k, 13) < 0.025) damaged[p] = 1 + Math.floor(h(st.idx, k, 14) * 3);
    }
  }
  const dcStock = new Int32Array(dcs.length * NSKU);
  for (const dc of dcs) {
    const served = stores.filter((s) => s.dcIdx === dc.idx);
    for (let k = 0; k < NSKU; k++) {
      let demand = 0;
      for (const s of served) demand += velocity[s.idx * NSKU + k];
      const sup = skus[k].supplierIdx;
      const days = LATE_SUPPLIERS.includes(sup) ? h(dc.idx, k, 21) * 6 : 10 + h(dc.idx, k, 22) * 30;
      dcStock[dc.idx * NSKU + k] = Math.round(demand * days);
    }
  }
  for (const st of stores) {
    let sales = 0;
    for (let k = 0; k < NSKU; k++) sales += velocity[st.idx * NSKU + k] * skus[k].price;
    st.monthlyTargetAed = Math.round(sales * 30 * (st.idx === S118 ? 1.18 : rng.range(0.92, 1.08)) / 1e3) * 1e3;
  }
  const pos = [];
  const skusBySupplier = /* @__PURE__ */ new Map();
  skus.forEach((s) => skusBySupplier.set(s.supplierIdx, [...skusBySupplier.get(s.supplierIdx) ?? [], s.idx]));
  let poN = 50001;
  for (let i = 0; i < 760; i++) {
    const sup = suppliers[Math.floor(rng.next() * suppliers.length)];
    const pool = skusBySupplier.get(sup.idx);
    if (!pool?.length) continue;
    const fresh = sup.leadTimeDays <= 3;
    const destType = fresh ? "store" : "dc";
    const destIdx = destType === "store" ? rng.int(0, stores.length - 1) : rng.int(0, dcs.length - 1);
    const createdOffset = -Math.floor(rng.next() * 70) - 1;
    const created = addDaysIso(anchorDate, createdOffset);
    const promised = addDaysIso(created, sup.leadTimeDays);
    const late = rng.next() > sup.onTimeTarget;
    const delay = late ? rng.int(2, LATE_SUPPLIERS.includes(sup.idx) ? 12 : 5) : rng.int(-1, 0);
    const arrival = addDaysIso(promised, delay);
    const arrived = arrival <= anchorDate;
    const lines = [];
    const n = rng.int(3, 9);
    for (let j = 0; j < n; j++) {
      const k = pool[Math.floor(rng.next() * pool.length)];
      if (lines.some((l) => l.skuIdx === k)) continue;
      const ordered = Math.max(6, Math.round(skus[k].baseRate * (destType === "dc" ? 60 : 4) * rng.range(4, 9)));
      const fill = rng.next() < sup.fillTarget ? 1 : rng.range(0.55, 0.92);
      const received = arrived ? Math.round(ordered * fill) : 0;
      const invAnomaly = arrived && rng.next() < 0.05;
      lines.push({
        skuIdx: k,
        ordered,
        received,
        unitCost: skus[k].cost,
        invoicedQty: arrived ? invAnomaly && rng.next() < 0.5 ? ordered : received : null,
        invoicedCost: arrived ? Math.round(skus[k].cost * (invAnomaly ? rng.range(1.06, 1.18) : 1) * 100) / 100 : null
      });
    }
    const partial = arrived && lines.some((l) => l.received < l.ordered);
    pos.push({
      id: `PO-${poN++}`,
      supplierIdx: sup.idx,
      destType,
      destIdx,
      created,
      promised,
      received: arrived ? arrival : null,
      status: arrived ? partial ? "Partially received" : "Received" : createdOffset > -2 && rng.next() < 0.5 ? "Pending approval" : "Sent",
      lines,
      createdBy: "Auto-replenishment",
      grn: arrived ? `GRN-${poN - 1 + 3e4}` : null,
      asn: !arrived && h(poN, 1, 31) < 0.7 && addDaysIso(promised, -Math.min(sup.leadTimeDays, 2)) <= anchorDate ? { id: `ASN-${poN - 1 + 7e4}`, shipped: addDaysIso(promised, -Math.min(sup.leadTimeDays, 2)), eta: arrival < anchorDate ? addDaysIso(anchorDate, 1 + Math.floor(h(poN, 2, 31) * 4)) : arrival, carrier: CARRIERS[Math.floor(h(poN, 3, 31) * CARRIERS.length)] } : null,
      flow: destType === "store" ? "Direct to store" : lines.every((l) => skus[l.skuIdx].perishable) || h(poN, 4, 31) < 0.2 ? "Cross-dock" : "Putaway"
    });
  }
  const equipment = [];
  const counts = {
    Hypermarket: { Freezer: 6, Chiller: 8, "Cold Room": 2, HVAC: 4, "POS Terminal": 22, Generator: 1 },
    Supermarket: { Freezer: 4, Chiller: 5, "Cold Room": 1, HVAC: 2, "POS Terminal": 9, Generator: 1 },
    Express: { Freezer: 2, Chiller: 2, "Cold Room": 0, HVAC: 1, "POS Terminal": 3, Generator: 0 }
  };
  const MAKES = {
    Freezer: ["Arctica ULT-90", "FrostLine FX6", "PolarCase 5D"],
    Chiller: ["CoolMax MD-4", "FrostLine CL3", "PolarCase Deli"],
    "Cold Room": ["ColdCore CR-40", "Arctica Walk-In 30"],
    HVAC: ["AirGulf 60TR", "DesertCool RTU-40"],
    "POS Terminal": ["Lumo POS 15", "TechNest T2 Register"],
    Generator: ["PowerGulf 250kVA", "Voltix GenSet 180"]
  };
  for (const st of stores) {
    let n = 1;
    for (const [type, cnt] of Object.entries(counts[st.format])) {
      for (let i = 0; i < cnt; i++) {
        const id = `${st.id}-${type === "POS Terminal" ? "POS" : type === "Cold Room" ? "CR" : type.slice(0, 3).toUpperCase()}${String(i + 1).padStart(2, "0")}`;
        const seed = st.idx * 1e3 + n++;
        const isCold = type === "Freezer" || type === "Chiller" || type === "Cold Room";
        const setpoint = type === "Freezer" ? -18 : type === "Chiller" ? 3 : type === "Cold Room" ? 2 : type === "HVAC" ? 24 : type === "POS Terminal" ? 100 : 100;
        const faultP = st.idx === S118 && type === "Freezer" && i === 1 ? 1 : isCold ? 0.03 : type === "POS Terminal" ? 0.02 : type === "HVAC" ? 0.04 : 0.03;
        const hasFault = h(seed, 1, 77) < faultP;
        const since = hasFault ? 6 + Math.floor(h(seed, 2, 77) * 30) : 99;
        const readings = [];
        for (let t = 0; t < 48; t++) {
          const drift = hasFault && t >= 48 - since ? t - (48 - since) + 1 : 0;
          let v2;
          if (isCold) v2 = setpoint + (h(seed, t, 3) - 0.5) * 1.2 + drift * (type === "Freezer" ? 0.33 : 0.2);
          else if (type === "HVAC") v2 = setpoint + (h(seed, t, 3) - 0.5) * 1.2 + drift * 0.18;
          else if (type === "POS Terminal") v2 = hasFault && t >= 48 - since ? 0 : 100;
          else v2 = Math.max(5, 100 - t * 0.4 - (hasFault ? drift * 2.4 : 0));
          readings.push(Math.round(v2 * 10) / 10);
        }
        equipment.push({
          id,
          storeIdx: st.idx,
          type,
          name: `${type} ${i + 1}`,
          make: MAKES[type][Math.floor(h(seed, 4) * MAKES[type].length)],
          installed: 2012 + Math.floor(h(seed, 5) * 12),
          setpoint: type === "Generator" ? null : setpoint,
          readings,
          unit: isCold || type === "HVAC" ? "\xB0C" : type === "POS Terminal" ? "% online" : "% fuel",
          fault: hasFault ? {
            kind: type === "Freezer" || type === "Chiller" || type === "Cold Room" ? "Temperature above safe range \xB7 possible compressor or door-seal failure" : type === "HVAC" ? "Supply air temperature rising \xB7 cooling capacity loss" : type === "POS Terminal" ? "Terminal offline \xB7 payment device not responding" : "Fuel level dropping faster than load profile",
            since
          } : null,
          lastService: addDaysIso(anchorDate, -Math.floor(h(seed, 6) * 200)),
          serviceIntervalDays: isCold ? 90 : type === "POS Terminal" ? 365 : 180
        });
      }
    }
  }
  const audits = [];
  const FINDINGS = {
    Shelf: ["Gaps on shelf in beverages aisle", "Planogram not followed in snacks", "Facings missing for promoted items", "Out-of-stock labels not displayed", "Products past sell-by date on shelf"],
    Safety: ["Fire exit partially blocked by pallets", "Wet floor without signage", "Ladder not stored correctly", "First-aid kit incomplete"],
    Hygiene: ["Deli counter cleaning log incomplete", "Bakery area surfaces not sanitised", "Pest control record overdue", "Staff hairnets not worn in butchery"],
    "Cold chain": ["Freezer temperature log gaps", "Chiller door left open", "Frozen goods stacked above load line"],
    Pricing: ["Shelf label does not match system price", "Promotion label still displayed after end date", "Missing unit price on shelf label"]
  };
  let auditN = 1;
  for (const st of stores) {
    for (const type of Object.keys(FINDINGS)) {
      for (let i = 0; i < 2; i++) {
        const base = st.idx === S118 ? 62 : 74;
        const score = Math.round(Math.min(100, base + rng.next() * 26));
        const nf = score > 92 ? 0 : score > 82 ? 1 : score > 72 ? 2 : 3;
        audits.push({
          id: `AUD-${String(auditN++).padStart(4, "0")}`,
          storeIdx: st.idx,
          type,
          date: addDaysIso(anchorDate, -rng.int(1 + i * 40, 40 + i * 45)),
          score,
          auditor: person(st.idx, auditN),
          findings: Array.from(new Set(Array.from({ length: nf }, () => rng.pick(FINDINGS[type]))))
        });
      }
    }
  }
  const pricingExceptions = [];
  for (let i = 0; i < 90; i++) {
    const s = i < 9 ? S118 : rng.int(0, stores.length - 1);
    let k = rng.int(0, NSKU - 1);
    for (let t = 0; t < 20 && !carried[s * NSKU + k]; t++) k = rng.int(0, NSKU - 1);
    const sys = skus[k].price;
    pricingExceptions.push({
      id: `PX-${1001 + i}`,
      storeIdx: s,
      skuIdx: k,
      systemPrice: sys,
      shelfPrice: Math.round(sys * (rng.next() < 0.5 ? rng.range(1.05, 1.25) : rng.range(0.78, 0.95)) * 100) / 100,
      found: addDaysIso(anchorDate, -rng.int(0, 10))
    });
  }
  const PROMOS = ["Ramadan Essentials", "Weekend Fresh Deals", "Back to School", "Healthy Living Week", "Mega Household Savings", "Baby Week", "Tech Fest", "Summer Beverages", "National Day Offers", "Breakfast Bundle", "Frozen Favourites", "Personal Care Picks"];
  const promotions = PROMOS.map((name, i) => ({
    id: `PROMO-${201 + i}`,
    name,
    skuIdxs: Array.from({ length: rng.int(15, 40) }, () => rng.int(0, NSKU - 1)),
    discountPct: rng.pick([10, 15, 20, 25, 30]),
    start: addDaysIso(anchorDate, -rng.int(1, 10)),
    end: addDaysIso(anchorDate, rng.int(3, 20)),
    countries: i % 3 === 0 ? ["AE", "SA", "QA", "KW", "OM", "BH"] : [rng.pick(["AE", "SA", "QA", "KW", "OM", "BH"])],
    upliftPct: rng.int(12, 65)
  }));
  const TASKS = [
    ["Opening checklist", "Checklist"],
    ["Closing checklist", "Checklist"],
    ["Cold chain temperature log", "Checklist"],
    ["Refill gaps in beverages aisle", "Replenishment"],
    ["Update shelf labels for price change", "Pricing"],
    ["Set up promotion end-caps", "Pricing"],
    ["Clean freezer condenser coils", "Maintenance"],
    ["Close audit findings", "Audit follow-up"],
    ["Rotate stock (FEFO) in dairy", "Replenishment"]
  ];
  const tasks = [];
  let taskN = 1;
  for (const st of stores) {
    const n = 3 + Math.floor(h(st.idx, 0, 41) * 4);
    for (let i = 0; i < n; i++) {
      const [title, type] = TASKS[Math.floor(h(st.idx, i, 42) * TASKS.length)];
      const r = h(st.idx, i, 43);
      tasks.push({
        id: `TSK-${String(taskN++).padStart(4, "0")}`,
        storeIdx: st.idx,
        title,
        type,
        due: addDaysIso(anchorDate, Math.floor(h(st.idx, i, 44) * 5) - 1),
        assignee: person(st.idx, 50 + i),
        status: r < 0.35 ? "Done" : r < 0.6 ? "In progress" : "Open"
      });
    }
  }
  const tickets = [];
  let tN = 3001;
  for (const [fi, e] of equipment.filter((x) => x.fault).entries()) {
    if (e.storeIdx === S118 || h(fi, 1, 51) < 0.6) continue;
    tickets.push({
      id: `TKT-${tN++}`,
      equipmentId: e.id,
      storeIdx: e.storeIdx,
      issue: e.fault.kind,
      priority: e.type === "Freezer" || e.type === "Cold Room" ? "P1" : "P2",
      status: "Assigned",
      technician: TECHNICIANS[Math.floor(h(tN, 2, 51) * TECHNICIANS.length)],
      created: addDaysIso(anchorDate, -1),
      resolved: null
    });
  }
  for (let i = 0; i < 18; i++) {
    const e = equipment[Math.floor(h(i, 3, 52) * equipment.length)];
    tickets.push({
      id: `TKT-${tN++}`,
      equipmentId: e.id,
      storeIdx: e.storeIdx,
      issue: rng.pick(["Preventive maintenance", "Door gasket replacement", "Receipt printer jam", "Filter replacement", "Compressor noise"]),
      priority: "P3",
      status: "Resolved",
      technician: rng.pick(TECHNICIANS),
      created: addDaysIso(anchorDate, -rng.int(5, 40)),
      resolved: addDaysIso(anchorDate, -rng.int(1, 4))
    });
  }
  const discountPct = new Uint8Array(N);
  const returns30 = new Uint16Array(N);
  const ageDays = new Uint16Array(N);
  const lyVelocity = new Float32Array(N);
  const activePromos = /* @__PURE__ */ new Map();
  for (const pr of promotions) if (pr.start <= anchorDate && pr.end >= anchorDate) for (const k of pr.skuIdxs) activePromos.set(k, [...activePromos.get(k) ?? [], pr]);
  const RETURN_RATE = { Electronics: 0.045, "Home & Living": 0.03, "Personal Care": 0.015, Baby: 0.012, Household: 0.01, Grocery: 6e-3, "Fresh Food": 4e-3, Frozen: 4e-3 };
  for (const st of stores) {
    const leakP = st.city === "Dubai" ? 0.1 : 0.012;
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!carried[p]) continue;
      const sku = skus[k];
      const v2 = velocity[p];
      if (!sku.perishable && v2 < 0.35 && h(st.idx, k, 60) < 0.02) {
        lastSaleDaysAgo[p] = 90 + Math.floor(h(st.idx, k, 61) * 140);
        if (onHand[p] < 3) onHand[p] = 3 + Math.floor(h(st.idx, k, 62) * 18);
      }
      const promo = activePromos.get(k)?.find((pr) => pr.countries.includes(st.country));
      let d = Math.floor(h(st.idx, k, 63) * 4);
      if (promo) d = Math.round(promo.discountPct * (0.55 + h(st.idx, k, 64) * 0.3));
      else if (v2 >= 0.3 && h(st.idx, k, 65) < leakP) d = 14 + Math.floor(h(st.idx, k, 66) * 19);
      discountPct[p] = d;
      const sold30 = v2 * Math.max(0, 30 - Math.min(30, lastSaleDaysAgo[p]));
      let rr = (RETURN_RATE[sku.department] ?? 8e-3) * (0.6 + h(st.idx, k, 67) * 0.8);
      if (h(st.idx, k, 68) < 4e-3 && sold30 > 3) rr = 0.15 + h(st.idx, k, 69) * 0.15;
      returns30[p] = Math.min(65535, Math.round(sold30 * rr));
      const cover = onHand[p] / Math.max(v2, 0.02);
      const age = lastSaleDaysAgo[p] >= 90 ? lastSaleDaysAgo[p] + 20 + h(st.idx, k, 70) * 120 : sku.perishable ? Math.min(sku.shelfLifeDays ?? 30, cover * 0.6 + 1) : Math.min(400, cover * (0.5 + h(st.idx, k, 70) * 0.7) + 3);
      ageDays[p] = Math.min(65535, Math.round(age));
      lyVelocity[p] = sku.status === "New" ? 0 : v2 * (st.idx === S118 ? 1.12 + h(st.idx, k, 71) * 0.2 : 0.86 + h(st.idx, k, 71) * 0.22) / (promo ? 1 + promo.upliftPct / 100 * 0.7 : 1);
    }
  }
  const storeDays = [];
  const WEEKDAY = [0.93, 0.87, 0.89, 0.95, 1.12, 1.24, 1.17];
  const r2 = (n) => Math.round(n * 100) / 100;
  for (const st of stores) {
    let gross = 0;
    let disc = 0;
    let cogs = 0;
    let units = 0;
    let ret = 0;
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!carried[p]) continue;
      const sku = skus[k];
      const u = velocity[p] * Math.max(0, 30 - Math.min(30, lastSaleDaysAgo[p])) / 30;
      gross += u * sku.price;
      disc += u * sku.price * discountPct[p] / 100;
      cogs += u * sku.landedCost;
      units += u;
      ret += returns30[p] / 30 * sku.price;
    }
    const atv = (st.format === "Hypermarket" ? 185 : st.format === "Supermarket" ? 108 : 44) * (0.9 + h(st.idx, 0, 83) * 0.2);
    const conv = (st.format === "Hypermarket" ? 0.66 : st.format === "Supermarket" ? 0.74 : 0.86) * (0.95 + h(st.idx, 0, 84) * 0.1);
    const lfl = st.idx === S118 ? -0.09 : -0.02 + h(st.idx, 0, 80) * 0.09;
    for (let d = 119; d >= 0; d--) {
      const date = addDaysIso(anchorDate, -d);
      let f = WEEKDAY[(/* @__PURE__ */ new Date(date + "T00:00:00Z")).getUTCDay()] * (0.94 + h(st.idx, d, 81) * 0.12);
      for (const ev of RETAIL_CALENDAR) if (ev.countries.includes(st.country) && date >= ev.start && date <= ev.end) f *= 1 + Math.max(...Object.values(ev.uplift)) * 0.35;
      if (st.idx === S118 && d < 35) f *= 0.84;
      const g = gross * f;
      const leakRamp = st.city === "Dubai" && d < 28 ? 1 + (28 - d) / 28 * 1.6 : st.city === "Dubai" ? 0.55 : 1;
      const net = g - disc * f * leakRamp - ret * f;
      const txns = Math.max(1, Math.round(net / (atv * (0.95 + h(st.idx, d, 82) * 0.1))));
      storeDays.push({
        storeIdx: st.idx,
        date,
        grossSales: r2(g),
        discounts: r2(disc * f * leakRamp),
        returns: r2(ret * f),
        netSales: r2(net),
        cogs: r2(cogs * f),
        transactions: txns,
        units: Math.round(units * f),
        footfall: Math.round(txns / (conv * (0.95 + h(st.idx, d, 85) * 0.1))),
        lyNetSales: r2(net / (1 + lfl) * (0.97 + h(st.idx, d, 86) * 0.06)),
        lyTransactions: Math.round(txns / (1 + lfl * 0.7))
      });
    }
  }
  const basket = basketAffinity(generatePosJournal({ anchorDate, stores, skus, carried, velocity, discountPct }), skus);
  return {
    anchorDate,
    countries: COUNTRIES,
    stores,
    dcs,
    skus,
    suppliers,
    pos,
    equipment,
    audits,
    pricingExceptions,
    promotions,
    tasks,
    tickets,
    carried,
    onHand,
    reserved,
    damaged,
    velocity,
    lastSaleDaysAgo,
    dcStock,
    discountPct,
    returns30,
    ageDays,
    lyVelocity,
    storeDays,
    calendar: RETAIL_CALENDAR,
    basket
  };
}
var AFFINITY = [
  ["Bakery", "Dairy & Eggs", 0.5],
  ["Snacks & Confectionery", "Beverages", 0.45],
  ["Meat & Poultry", "Fruits & Vegetables", 0.5],
  ["Canned & Packaged", "Staples", 0.35],
  ["Cleaning", "Paper & Disposables", 0.4],
  ["Frozen Food", "Beverages", 0.25],
  ["Dairy & Eggs", "Bakery", 0.3],
  ["Hair & Body", "Cleaning", 0.2]
];
function generatePosJournal(b, perStore = 120) {
  const rng = createRng(SEED2 + 777);
  const out = [];
  for (const st of b.stores) {
    const byCat = /* @__PURE__ */ new Map();
    const catWeight = /* @__PURE__ */ new Map();
    for (let k = 0; k < NSKU; k++) {
      const p = st.idx * NSKU + k;
      if (!b.carried[p]) continue;
      const c = b.skus[k].category;
      const e = byCat.get(c) ?? { skus: [], cum: [] };
      const w = b.velocity[p] * b.skus[k].price;
      e.skus.push(k);
      e.cum.push((e.cum[e.cum.length - 1] ?? 0) + w);
      byCat.set(c, e);
      catWeight.set(c, (catWeight.get(c) ?? 0) + w);
    }
    const cats = [...catWeight.entries()];
    const catTotal = cats.reduce((a, [, w]) => a + w, 0);
    const pickCat = () => {
      let r = rng.next() * catTotal;
      for (const [c, w] of cats) if ((r -= w) <= 0) return c;
      return cats[cats.length - 1][0];
    };
    const pickSku = (c) => {
      const e = byCat.get(c);
      const r = rng.next() * e.cum[e.cum.length - 1];
      let lo = 0;
      let hi = e.cum.length - 1;
      while (lo < hi) {
        const mid = lo + hi >> 1;
        if (e.cum[mid] < r) lo = mid + 1;
        else hi = mid;
      }
      return e.skus[lo];
    };
    const meanItems = st.format === "Hypermarket" ? 9 : st.format === "Supermarket" ? 6 : 3;
    for (let t = 0; t < perStore; t++) {
      const n = Math.max(1, Math.round(meanItems * (0.3 + rng.next() * 1.4)));
      const inBasket = /* @__PURE__ */ new Set();
      const lines = [];
      for (let i = 0; i < n; i++) {
        let c = pickCat();
        if (i > 0 && rng.next() < 0.5) {
          const rule = AFFINITY.find(([a, bb]) => inBasket.has(a) && !inBasket.has(bb) && byCat.has(bb));
          if (rule && rng.next() < rule[2] * 1.6) c = rule[1];
        }
        inBasket.add(c);
        const k = pickSku(c);
        if (lines.some((l) => l.skuIdx === k)) continue;
        const sku = b.skus[k];
        const qty = sku.baseUom === "kg" ? Math.round((0.4 + rng.next() * 2) * 100) / 100 : 1 + (rng.next() < 0.2 ? 1 : 0);
        const disc = b.discountPct[st.idx * NSKU + k];
        lines.push({ skuIdx: k, qty, unitPrice: sku.price, discount: Math.round(sku.price * qty * disc) / 100 });
      }
      const minutes = 8 * 60 + Math.floor(t / perStore * 14 * 60 + rng.next() * 6);
      out.push({
        id: `TXN-${st.id}-${String(t + 1).padStart(4, "0")}`,
        storeIdx: st.idx,
        at: `${b.anchorDate}T${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}:00+04:00`,
        tender: rng.next() < 0.68 ? "Card" : rng.next() < 0.55 ? "Cash" : "Mobile wallet",
        member: rng.next() < 0.42,
        lines,
        total: Math.round(lines.reduce((a, l) => a + l.unitPrice * l.qty - l.discount, 0) * 100) / 100
      });
    }
  }
  return out;
}
function basketAffinity(journal, skus) {
  const n = journal.length || 1;
  const single = /* @__PURE__ */ new Map();
  const pair = /* @__PURE__ */ new Map();
  for (const t of journal) {
    const cats = [...new Set(t.lines.map((l) => skus[l.skuIdx].category))].sort();
    for (const c of cats) single.set(c, (single.get(c) ?? 0) + 1);
    for (let i = 0; i < cats.length; i++) for (let j = i + 1; j < cats.length; j++) pair.set(`${cats[i]}|${cats[j]}`, (pair.get(`${cats[i]}|${cats[j]}`) ?? 0) + 1);
  }
  const out = [];
  for (const [key, cnt] of pair) {
    if (cnt < 25) continue;
    const [x, y] = key.split("|");
    for (const [a, b] of [[x, y], [y, x]]) {
      const confidence = cnt / single.get(a);
      const lift = confidence / (single.get(b) / n);
      out.push({ a, b, baskets: cnt, support: Math.round(cnt / n * 1e4) / 1e4, confidence: Math.round(confidence * 1e3) / 1e3, lift: Math.round(lift * 100) / 100 });
    }
  }
  return out.sort((p, q) => q.lift - p.lift).slice(0, 40);
}
function batchesFor(base, s, k, onHand) {
  const sku = base.skus[k];
  if (!sku.perishable || onHand <= 0) return [];
  const shelf = sku.shelfLifeDays ?? 30;
  const v2 = base.velocity[s * NSKU + k];
  const risky = h(s, k, 61) < 0.06;
  const out = [];
  let remaining = onHand;
  const n = onHand > v2 * 4 ? 3 : onHand > v2 * 2 ? 2 : 1;
  for (let i = 0; i < n && remaining > 0; i++) {
    const daysLeft = i === 0 ? risky ? Math.max(1, Math.floor(1 + h(s, k, 62) * Math.min(12, shelf - 1))) : Math.max(1, Math.floor(shelf * (0.35 + h(s, k, 63) * 0.4))) : Math.floor(shelf * (0.6 + i * 0.15));
    const share = i === 0 ? Math.max(1, Math.min(remaining, Math.round(risky ? v2 * daysLeft * (1.8 + h(s, k, 64) * 2.2) + 1 : v2 * daysLeft * 0.7))) : i === n - 1 ? remaining : Math.max(1, Math.round(remaining * 0.5));
    remaining -= share;
    out.push({
      lot: `L${(sku.idx * 7 + s * 13 + i * 101).toString(36).toUpperCase().padStart(6, "0")}`,
      qty: share,
      mfg: addDaysIso(base.anchorDate, daysLeft - shelf),
      expiry: addDaysIso(base.anchorDate, daysLeft),
      daysLeft
    });
  }
  return out;
}
function oldestBatchQuick(base, s, k, onHand) {
  const sku = base.skus[k];
  if (!sku.perishable || onHand <= 0) return null;
  const shelf = sku.shelfLifeDays ?? 30;
  const v2 = base.velocity[s * NSKU + k];
  const risky = h(s, k, 61) < 0.06;
  const daysLeft = risky ? Math.max(1, Math.floor(1 + h(s, k, 62) * Math.min(12, shelf - 1))) : Math.max(1, Math.floor(shelf * (0.35 + h(s, k, 63) * 0.4)));
  const qty = Math.max(1, Math.min(onHand, Math.round(risky ? v2 * daysLeft * (1.8 + h(s, k, 64) * 2.2) + 1 : v2 * daysLeft * 0.7)));
  return { daysLeft, qty };
}

// src/demo/localData.ts
var BUSINESS_DATE = "2026-11-12";
var industrial = null;
var retail = null;
function getIndustrialData() {
  industrial ??= generateDataset(/* @__PURE__ */ new Date(`${BUSINESS_DATE}T00:00:00Z`));
  return industrial;
}
function getRetailData() {
  retail ??= generateRetail(/* @__PURE__ */ new Date(`${BUSINESS_DATE}T00:00:00Z`));
  return retail;
}

// src/server/demo/data.ts
var NotSignedInError = class extends Error {
  constructor() {
    super("Your session has ended. Please sign in again.");
  }
};
var client = null;
function convex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not configured");
  client ??= new ConvexHttpClient(url);
  return client;
}
async function requireSession(token) {
  if (!token) throw new NotSignedInError();
  const me = await convex().query(api.scioAuth.me, { token });
  if (!me) throw new NotSignedInError();
}
async function getIndustrialData2(token) {
  await requireSession(token);
  return getIndustrialData();
}
async function getRetailData2(token) {
  await requireSession(token);
  return getRetailData();
}

// src/demo/data/analytics.ts
var DAY3 = 864e5;
function daysBetween(fromIso, toIso2) {
  return Math.round((new Date(toIso2).getTime() - new Date(fromIso).getTime()) / DAY3);
}
var sum = (xs) => xs.reduce((a, b) => a + b, 0);
var mean = (xs) => xs.length ? sum(xs) / xs.length : 0;
function avgDailyUsage(item, days = 30) {
  return mean(item.dailyUsage.slice(-days));
}
function inventoryValue(ds) {
  return sum(ds.items.map((i) => i.stock * i.unitCost));
}
function stockShortages(ds) {
  const whName = new Map(ds.warehouses.map((w) => [w.id, w.name]));
  const dueSoon = ds.assets.filter((a) => daysBetween(ds.anchorDate, a.nextServiceDate) <= 7);
  return ds.items.filter((i) => i.stock < i.minStock).map((item) => {
    const rate = avgDailyUsage(item);
    return {
      item,
      warehouseName: whName.get(item.warehouseId) ?? item.warehouseId,
      shortfall: item.minStock - item.stock,
      daysOfCover: rate > 0 ? item.stock / rate : Infinity,
      replenishCost: (item.maxStock - item.stock) * item.unitCost,
      linkedAssets: dueSoon.filter((a) => a.partIds.includes(item.id))
    };
  }).sort((a, b) => {
    const crit = (r) => (r.linkedAssets.length ? 0 : 1) + (r.item.criticality === "Critical" ? 0 : 0.5);
    return crit(a) - crit(b) || a.daysOfCover - b.daysOfCover;
  });
}
function shortagesByWarehouse(ds) {
  const rows = stockShortages(ds);
  return ds.warehouses.map((w) => {
    const mine = rows.filter((r) => r.item.warehouseId === w.id);
    return {
      warehouse: w,
      shortageCount: mine.length,
      criticalCount: mine.filter((r) => r.item.criticality === "Critical").length,
      replenishCost: sum(mine.map((r) => r.replenishCost))
    };
  });
}
function excessInventory(ds) {
  return ds.items.filter((i) => i.stock > i.maxStock).map((item) => ({
    item,
    excessUnits: item.stock - item.maxStock,
    tiedUpValue: (item.stock - item.maxStock) * item.unitCost,
    daysOfCover: avgDailyUsage(item, 90) > 0 ? item.stock / avgDailyUsage(item, 90) : Infinity
  })).sort((a, b) => b.tiedUpValue - a.tiedUpValue);
}
function overdueMaintenance(ds) {
  return ds.assets.map((a) => ({ asset: a, daysOverdue: -daysBetween(ds.anchorDate, a.nextServiceDate) })).filter((r) => r.daysOverdue > 0).sort((a, b) => b.daysOverdue - a.daysOverdue);
}
function dueThisWeek(ds) {
  return ds.assets.filter((a) => {
    const d = daysBetween(ds.anchorDate, a.nextServiceDate);
    return d >= 0 && d <= 7;
  });
}
function repeatInspectionFailures(ds, minFails = 2) {
  return ds.assets.map((asset) => {
    const fails = ds.inspections.filter((i) => i.assetId === asset.id && i.result === "Fail");
    return { asset, failCount: fails.length, findings: fails.map((f) => f.finding) };
  }).filter((r) => r.failCount >= minFails).sort((a, b) => b.failCount - a.failCount);
}
function assetRisk(asset) {
  const base = asset.vibration.slice(0, 60);
  const recent = asset.vibration.slice(-7);
  const mu = mean(base);
  const sd2 = Math.sqrt(mean(base.map((x) => (x - mu) ** 2))) || 0.1;
  const z = (mean(recent) - mu) / sd2;
  const risk = Math.max(0, Math.min(100, Math.round(10 + z * 12)));
  return { z, risk, baseline: mu, recent: mean(recent) };
}
function riskiestAssets(ds, n = 5) {
  return ds.assets.map((asset) => ({ asset, ...assetRisk(asset) })).sort((a, b) => b.risk - a.risk).slice(0, n);
}
function supplierPerformance(ds) {
  return ds.suppliers.map((s) => {
    const delivered = ds.purchaseOrders.filter((p) => p.supplierId === s.id && p.deliveredDate);
    const delays = delivered.map((p) => daysBetween(p.promisedDate, p.deliveredDate));
    const onTime = delays.filter((d) => d <= 0).length;
    return {
      supplier: s,
      orders: delivered.length,
      onTimeRate: delivered.length ? onTime / delivered.length : 1,
      avgDelayDays: mean(delays.map((d) => Math.max(0, d))),
      spend: sum(ds.purchaseOrders.filter((p) => p.supplierId === s.id).map((p) => p.quantity * p.unitPrice))
    };
  }).filter((r) => r.orders > 0).sort((a, b) => b.avgDelayDays - a.avgDelayDays);
}
function overallOnTimeRate(ds) {
  const delivered = ds.purchaseOrders.filter((p) => p.deliveredDate);
  const onTime = delivered.filter((p) => daysBetween(p.promisedDate, p.deliveredDate) <= 0).length;
  return delivered.length ? onTime / delivered.length : 1;
}
function monthlySpend(ds) {
  const buckets = /* @__PURE__ */ new Map();
  const anchor = new Date(ds.anchorDate);
  for (let m = 12; m >= 1; m--) {
    const d = new Date(Date.UTC(anchor.getUTCFullYear(), anchor.getUTCMonth() - m, 1));
    buckets.set(d.toISOString().slice(0, 7), 0);
  }
  for (const po of ds.purchaseOrders) {
    const key = po.orderDate.slice(0, 7);
    if (buckets.has(key)) buckets.set(key, buckets.get(key) + po.quantity * po.unitPrice);
  }
  return Array.from(buckets, ([month, spend]) => ({
    month,
    label: (/* @__PURE__ */ new Date(month + "-01T00:00:00Z")).toLocaleString("en", { month: "short", timeZone: "UTC" }),
    spend: Math.round(spend)
  }));
}
function totalSpend12m(ds) {
  return sum(monthlySpend(ds).map((m) => m.spend));
}
function topSpendItems(ds, n = 10) {
  const byItem = /* @__PURE__ */ new Map();
  for (const po of ds.purchaseOrders) byItem.set(po.itemId, (byItem.get(po.itemId) ?? 0) + po.quantity * po.unitPrice);
  const itemById = new Map(ds.items.map((i) => [i.id, i]));
  return Array.from(byItem, ([id, spend]) => ({ item: itemById.get(id), spend })).sort((a, b) => b.spend - a.spend).slice(0, n);
}
function openPurchaseOrders(ds) {
  return ds.purchaseOrders.filter((p) => !p.deliveredDate);
}
var fmtMoney = (n) => "AED " + Math.round(n).toLocaleString("en-US");
function todaysIssues(ds) {
  const issues = [];
  const shortages = stockShortages(ds);
  for (const wh of shortagesByWarehouse(ds).filter((w) => w.shortageCount > 0)) {
    const linked = shortages.filter((r) => r.item.warehouseId === wh.warehouse.id && r.linkedAssets.length);
    const linkedAssetIds = Array.from(new Set(linked.flatMap((l) => l.linkedAssets.map((a) => a.id))));
    issues.push({
      id: `short-${wh.warehouse.id}`,
      severity: linked.length ? "critical" : wh.criticalCount ? "warning" : "info",
      area: "Inventory",
      title: `${wh.warehouse.name.split(" \xB7 ")[0]}: Parts below minimum stock`,
      detail: linked.length ? `${wh.shortageCount} part${wh.shortageCount > 1 ? "s" : ""} below minimum (${wh.criticalCount} critical) \xB7 ${linked.length} needed for maintenance on ${linkedAssetIds.join(", ")} within 7 days.` : `${wh.shortageCount} part${wh.shortageCount > 1 ? "s" : ""} below minimum (${wh.criticalCount} critical) \xB7 replenishment about ${fmtMoney(wh.replenishCost)}.`,
      recommendation: linked.length ? "Prioritise replenishment of the parts linked to this week's maintenance." : "Raise purchase requests for the critical items."
    });
  }
  const overdue = overdueMaintenance(ds);
  if (overdue.length) {
    const critical = overdue.filter((o) => o.asset.criticality === "Critical" || o.asset.criticality === "High");
    issues.push({
      id: "overdue",
      severity: critical.length ? "critical" : "warning",
      area: "Maintenance",
      title: `${overdue.length} assets have overdue maintenance`,
      detail: `${critical.length} are high or critical. Most overdue: ${overdue[0].asset.name} (${overdue[0].daysOverdue} days).`,
      recommendation: "Schedule the critical assets first and confirm parts availability."
    });
  }
  const risky = riskiestAssets(ds, 3).filter((r) => r.risk >= 50);
  for (const r of risky) {
    issues.push({
      id: `risk-${r.asset.id}`,
      severity: r.risk >= 75 ? "critical" : "warning",
      area: "Assets",
      title: `${r.asset.name}: abnormal vibration trend`,
      detail: `7-day average ${r.recent.toFixed(1)} mm/s vs. baseline ${r.baseline.toFixed(1)} mm/s. Risk score ${r.risk}/100.`,
      recommendation: "Schedule an inspection before the next production run."
    });
  }
  const late = supplierPerformance(ds).filter((s) => s.avgDelayDays >= 4).slice(0, 2);
  for (const s of late) {
    const open = openPurchaseOrders(ds).filter((p) => p.supplierId === s.supplier.id).length;
    issues.push({
      id: `sup-${s.supplier.id}`,
      severity: "warning",
      area: "Procurement",
      title: `${s.supplier.name} is delivering ${s.avgDelayDays.toFixed(1)} days late on average`,
      detail: `On-time rate ${(s.onTimeRate * 100).toFixed(0)}% across ${s.orders} deliveries. ${open} order${open === 1 ? "" : "s"} still open.`,
      recommendation: "Add buffer to lead times or qualify an alternative supplier."
    });
  }
  const rank = { critical: 0, warning: 1, info: 2 };
  return issues.sort((a, b) => rank[a.severity] - rank[b.severity]);
}
function spendByCategory(ds) {
  const cat = new Map(ds.items.map((i) => [i.id, i.category]));
  const by = /* @__PURE__ */ new Map();
  for (const po of ds.purchaseOrders) {
    const c = cat.get(po.itemId) ?? "Other";
    by.set(c, (by.get(c) ?? 0) + po.quantity * po.unitPrice);
  }
  return Array.from(by, ([category, spend]) => ({ category, spend: Math.round(spend) })).sort((a, b) => b.spend - a.spend);
}

// src/demo/data/forecast.ts
var DAY4 = 864e5;
var SEASON = 7;
var sum2 = (xs) => xs.reduce((a, b) => a + b, 0);
var mean2 = (xs) => xs.length ? sum2(xs) / xs.length : 0;
function fitHoltWinters(y, alpha = 0.18, beta = 0.02, gamma = 0.12) {
  const n = y.length;
  const first = y.slice(0, SEASON * 2);
  let level = mean2(first);
  let trend = (mean2(y.slice(SEASON, SEASON * 2)) - mean2(y.slice(0, SEASON))) / SEASON;
  const season = Array.from({ length: SEASON }, (_, i) => mean2([y[i], y[i + SEASON]].filter((v2) => v2 !== void 0)) - level);
  const residuals = [];
  for (let t = 0; t < n; t++) {
    const s = season[t % SEASON];
    const fitted = level + trend + s;
    residuals.push(y[t] - fitted);
    const prevLevel = level;
    level = alpha * (y[t] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    season[t % SEASON] = gamma * (y[t] - level) + (1 - gamma) * s;
  }
  const r = residuals.slice(SEASON * 2);
  const residualSd = Math.sqrt(mean2(r.map((x) => x * x))) || 0.5;
  return { level, trend, season, residualSd };
}
function project(m, startIndex, horizon) {
  return Array.from({ length: horizon }, (_, h2) => Math.max(0, m.level + (h2 + 1) * m.trend + m.season[(startIndex + h2) % SEASON]));
}
function forecastItem(ds, item, horizon = 60, supplierDelay = 0) {
  const y = item.dailyUsage;
  const n = y.length;
  const hold = 28;
  const bt = fitHoltWinters(y.slice(0, n - hold));
  const btPred = project(bt, n - hold, hold);
  const actualSum = sum2(y.slice(n - hold));
  const predSum = sum2(btPred);
  const accuracy = actualSum > 0 ? Math.max(0, 1 - Math.abs(predSum - actualSum) / actualSum) : 1;
  const model = fitHoltWinters(y);
  const forecast = project(model, n, horizon);
  const z = 1.28;
  const lower = forecast.map((f, h2) => Math.max(0, f - z * model.residualSd * Math.sqrt(1 + h2 * 0.05)));
  const upper = forecast.map((f, h2) => f + z * model.residualSd * Math.sqrt(1 + h2 * 0.05));
  const today = new Date(ds.anchorDate).getTime();
  const inbound = ds.purchaseOrders.filter((p) => p.itemId === item.id && !p.deliveredDate).map((po) => ({ po, expectedDay: Math.max(1, Math.round((new Date(po.promisedDate).getTime() - today) / DAY4 + supplierDelay)) }));
  const onOrder = sum2(inbound.map((i) => i.po.quantity));
  const projectedStock = [];
  let stock = item.stock;
  let daysToCritical = item.stock < item.minStock ? 0 : null;
  let daysToStockout = item.stock <= 0 ? 0 : null;
  for (let d = 0; d < horizon; d++) {
    stock -= forecast[d];
    for (const ib of inbound) if (ib.expectedDay === d + 1) stock += ib.po.quantity;
    projectedStock.push(Math.round(stock * 10) / 10);
    if (daysToCritical === null && stock < item.minStock) daysToCritical = d + 1;
    if (daysToStockout === null && stock <= 0) daysToStockout = d + 1;
  }
  const lt = item.leadTimeDays + Math.max(0, supplierDelay);
  const safetyStock = Math.ceil(1.65 * model.residualSd * Math.sqrt(lt));
  const ltDemand = sum2(forecast.slice(0, lt));
  const reorderPoint = Math.ceil(ltDemand + safetyStock);
  const reviewDays = 30;
  const target = sum2(forecast.slice(0, lt + reviewDays)) + safetyStock;
  const pack = item.unitCost > 1e3 ? 1 : item.unitCost > 200 ? 5 : 10;
  const rawQty = Math.max(0, target - item.stock - onOrder);
  const recommendedQty = rawQty > 0 ? Math.ceil(rawQty / pack) * pack : 0;
  let orderBy = null;
  let urgency = "ok";
  if (recommendedQty > 0) {
    const crit = daysToCritical ?? horizon + 1;
    const slack = crit - lt;
    orderBy = new Date(today + Math.max(0, slack) * DAY4).toISOString().slice(0, 10);
    urgency = slack <= 0 ? "order-now" : slack <= 7 ? "this-week" : "planned";
  }
  const avgDaily30 = mean2(y.slice(-30));
  const forecastDaily30 = mean2(forecast.slice(0, 30));
  return {
    item,
    forecast,
    lower,
    upper,
    accuracy,
    avgDaily30,
    forecastDaily30,
    trendPct: avgDaily30 > 0 ? (forecastDaily30 - avgDaily30) / avgDaily30 : 0,
    onOrder,
    inbound,
    projectedStock,
    daysToCritical,
    daysToStockout,
    safetyStock,
    reorderPoint,
    recommendedQty,
    recommendedCost: recommendedQty * item.unitCost,
    orderBy,
    urgency
  };
}
var cache = null;
function forecastAll(ds) {
  if (cache && cache.key === ds.anchorDate) return cache.rows;
  const delays = new Map(supplierPerformance(ds).map((s) => [s.supplier.id, s.avgDelayDays]));
  const rows = ds.items.map((it) => forecastItem(ds, it, 60, Math.round(delays.get(it.supplierId) ?? 0)));
  cache = { key: ds.anchorDate, rows };
  return rows;
}
var URGENCY_RANK = { "order-now": 0, "this-week": 1, planned: 2, ok: 3 };
function reorderPlan(ds) {
  return forecastAll(ds).filter((f) => f.recommendedQty > 0).sort((a, b) => URGENCY_RANK[a.urgency] - URGENCY_RANK[b.urgency] || (a.daysToCritical ?? 999) - (b.daysToCritical ?? 999));
}
function portfolioAccuracy(ds) {
  const rows = forecastAll(ds);
  const w = rows.map((r) => r.avgDaily30 * r.item.unitCost);
  const tw = sum2(w) || 1;
  return sum2(rows.map((r, i) => r.accuracy * w[i])) / tw;
}

// src/demo/data/assetHealth.ts
var DAY5 = 864e5;
var mean3 = (xs) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
var sd = (xs) => {
  const m = mean3(xs);
  return Math.sqrt(mean3(xs.map((x) => (x - m) ** 2)));
};
var VIBRATION_ZONES = { good: 2.8, acceptable: 4.5, alarm: 7.1 };
function slope(ys) {
  const xs = ys.map((_, i) => i);
  const mx = mean3(xs);
  const my = mean3(ys);
  const num2 = xs.reduce((a, x, i) => a + (x - mx) * (ys[i] - my), 0);
  const den = xs.reduce((a, x) => a + (x - mx) ** 2, 0) || 1;
  return num2 / den;
}
function analyseSignal(series) {
  const base = series.slice(0, 60);
  const m = mean3(base);
  const s = sd(base) || 0.05;
  const anomalies = series.map((v2, i) => Math.abs(v2 - m) > 3 * s ? i : -1).filter((i) => i >= 0);
  const recent = series.slice(-7);
  return {
    series,
    baselineMean: m,
    baselineSd: s,
    upper: m + 3 * s,
    lower: m - 3 * s,
    anomalies,
    recentMean: mean3(recent),
    zRecent: (mean3(recent) - m) / s,
    slopePerDay: slope(series.slice(-14))
  };
}
function assetHealth(ds, asset) {
  const vib = analyseSignal(asset.vibration);
  const pres = asset.pressure.some((p) => p > 0) ? analyseSignal(asset.pressure) : null;
  const daysOverdue = Math.max(0, Math.round((new Date(ds.anchorDate).getTime() - new Date(asset.nextServiceDate).getTime()) / DAY5));
  const inspectionFails = ds.inspections.filter((i) => i.assetId === asset.id && i.result === "Fail").length;
  const parts = ds.items.filter((i) => asset.partIds.includes(i.id));
  const partsAvailable = parts.filter((p) => p.stock >= 1).length;
  let daysToAlarm = null;
  if (vib.slopePerDay > 0.02 && vib.recentMean < VIBRATION_ZONES.alarm) {
    daysToAlarm = Math.max(1, Math.round((VIBRATION_ZONES.alarm - asset.vibration[asset.vibration.length - 1]) / vib.slopePerDay));
  } else if (vib.recentMean >= VIBRATION_ZONES.alarm) daysToAlarm = 0;
  const drivers = [];
  let risk = 5;
  if (vib.zRecent > 2) {
    risk += Math.min(45, vib.zRecent * 7);
    drivers.push(`Vibration ${vib.recentMean.toFixed(1)} mm/s vs ${vib.baselineMean.toFixed(1)} mm/s baseline`);
  }
  if (vib.slopePerDay > 0.05) {
    risk += Math.min(15, vib.slopePerDay * 40);
    drivers.push(`Rising ${vib.slopePerDay.toFixed(2)} mm/s per day over the last 14 days`);
  }
  if (pres && pres.zRecent < -2) {
    risk += Math.min(15, -pres.zRecent * 3);
    drivers.push(`Pressure ${pres.recentMean.toFixed(1)} bar, below normal ${pres.baselineMean.toFixed(1)} bar`);
  }
  if (daysOverdue > 0) {
    risk += Math.min(15, daysOverdue / 2);
    drivers.push(`Maintenance ${daysOverdue} days overdue`);
  }
  if (inspectionFails >= 2) {
    risk += inspectionFails * 4;
    drivers.push(`${inspectionFails} failed inspections in 12 months`);
  }
  if (partsAvailable < parts.length) drivers.push(`${parts.length - partsAvailable} required spare part(s) out of stock`);
  const riskScore = Math.round(Math.min(100, risk));
  const healthScore = 100 - riskScore;
  const status = riskScore >= 70 ? "Critical" : riskScore >= 45 ? "At risk" : riskScore >= 25 ? "Watch" : "Healthy";
  return { asset, vibration: vib, pressure: pres, healthScore, riskScore, status, daysToAlarm, daysOverdue, inspectionFails, partsAvailable, partsTotal: parts.length, drivers };
}
function fleetHealth(ds) {
  return ds.assets.map((a) => assetHealth(ds, a)).sort((a, b) => b.riskScore - a.riskScore);
}

// src/server/demo/sarvam.ts
var SARVAM_URL = "https://api.sarvam.ai/v2/chat/completions";
function sarvamConfigured() {
  return Boolean(process.env.SARVAM_API_KEY);
}
async function sarvamChat(opts) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new Error("SARVAM_API_KEY is not configured");
  const body = {
    model: process.env.SARVAM_MODEL || "gemma4",
    messages: opts.messages,
    max_tokens: opts.maxTokens ?? 1200,
    temperature: opts.temperature ?? 0.2
  };
  if (opts.tools?.length) {
    body.tools = opts.tools;
    body.tool_choice = "auto";
  }
  if (opts.json) body.response_format = { type: "json_object" };
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 55e3);
  try {
    const res = await fetch(SARVAM_URL, {
      method: "POST",
      headers: { "api-subscription-key": key, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: ctrl.signal
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Sarvam API ${res.status}: ${text.slice(0, 300)}`);
    }
    const data = await res.json();
    const choice = data.choices?.[0];
    if (!choice) throw new Error("Sarvam API returned no choices");
    return { message: choice.message, finishReason: choice.finish_reason, tokens: data.usage?.total_tokens ?? 0 };
  } finally {
    clearTimeout(timer);
  }
}
function parseJsonLoose(text) {
  if (!text) return null;
  const cleaned = text.replace(/```(?:json)?/gi, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}
var hits = /* @__PURE__ */ new Map();
function rateLimited(ip, limit = 30, windowMs = 10 * 6e4) {
  const now = Date.now();
  const arr2 = (hits.get(ip) ?? []).filter((t) => now - t < windowMs);
  arr2.push(now);
  hits.set(ip, arr2);
  return arr2.length > limit;
}

// src/server/demo/copilot.ts
var r0 = (n) => Math.round(n);
var r1 = (n) => Math.round(n * 10) / 10;
function matchWarehouse(ds, w) {
  if (!w || typeof w !== "string") return null;
  const q = w.toLowerCase().replace(/warehouse/g, "").replace(/[^a-z0-9 -]/g, "").trim();
  if (!q || q === "all" || q === "any") return null;
  const byId = ds.warehouses.find((x) => x.id.toLowerCase() === q || x.id.toLowerCase().endsWith("-" + q));
  if (byId) return byId.id;
  if (q.length < 3) return null;
  const hit = ds.warehouses.find((x) => x.city.toLowerCase().includes(q) || x.name.toLowerCase().split(/[\s·]+/).some((word) => word === q || q.length >= 4 && word.startsWith(q)));
  return hit?.id ?? null;
}
function matchSite(ds, s) {
  if (!s || typeof s !== "string") return null;
  const q = s.toLowerCase();
  const sites = Array.from(new Set(ds.assets.map((a) => a.site)));
  return sites.find((x) => x.toLowerCase().includes(q) || q.includes(x.toLowerCase().split(" ")[0])) ?? null;
}
var limitOf = (a, def = 10, max = 25) => Math.min(max, Math.max(1, Number(a.limit) || def));
var DOWNTIME_AED_PER_HOUR = { Critical: 18e3, High: 9e3, Medium: 3500, Low: 1200 };
var TOOLS = [
  {
    type: "function",
    function: {
      name: "get_business_overview",
      description: "High-level KPIs: inventory value, shortages, overdue maintenance, supplier on-time rate, 12-month spend, and today's top issues.",
      parameters: { type: "object", properties: {} }
    },
    run: (ds) => {
      const issues = todaysIssues(ds);
      return {
        data: {
          currency: "AED",
          inventoryValue: r0(inventoryValue(ds)),
          skus: ds.items.length,
          partsBelowMinimum: stockShortages(ds).length,
          assets: ds.assets.length,
          overdueMaintenance: overdueMaintenance(ds).length,
          supplierOnTimeRate: r1(overallOnTimeRate(ds) * 100) + "%",
          procurementSpend12m: r0(totalSpend12m(ds)),
          topIssues: issues.slice(0, 6).map((i) => ({ severity: i.severity, title: i.title, detail: i.detail, recommendation: i.recommendation }))
        },
        visuals: [
          {
            kind: "table",
            title: "Today's priorities",
            columns: [
              { key: "severity", label: "Severity" },
              { key: "area", label: "Area" },
              { key: "title", label: "Issue" },
              { key: "recommendation", label: "Recommendation" }
            ],
            rows: issues.map((i) => ({ severity: i.severity, area: i.area, title: i.title, recommendation: i.recommendation }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_stock_shortages",
      description: "Inventory items below minimum stock, optionally for one warehouse (A, B, C or city: Dubai, Riyadh, Dammam). Includes days of cover, replenishment cost and assets due for maintenance that need the part.",
      parameters: {
        type: "object",
        properties: {
          warehouse: { type: "string", description: "Warehouse letter, name or city" },
          critical_only: { type: "boolean" },
          limit: { type: "number" }
        }
      }
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      let rows = stockShortages(ds).filter((r) => !wh || r.item.warehouseId === wh);
      if (a.critical_only) rows = rows.filter((r) => r.item.criticality === "Critical");
      const byWh = shortagesByWarehouse(ds);
      const list = rows.slice(0, limitOf(a, 15));
      return {
        data: {
          currency: "AED",
          totalShortItems: rows.length,
          byWarehouse: byWh.map((w) => ({ warehouse: w.warehouse.name, shortItems: w.shortageCount, critical: w.criticalCount, replenishCost: r0(w.replenishCost) })),
          items: list.map((r) => ({
            sku: r.item.id,
            name: r.item.name,
            warehouse: r.warehouseName,
            criticality: r.item.criticality,
            stock: r.item.stock,
            minimum: r.item.minStock,
            daysOfCover: Number.isFinite(r.daysOfCover) ? r1(r.daysOfCover) : null,
            replenishCost: r0(r.replenishCost),
            neededForMaintenanceOn: r.linkedAssets.map((x) => x.id)
          }))
        },
        visuals: [
          {
            kind: "bar",
            title: "Parts below minimum by warehouse",
            xKey: "warehouse",
            series: [
              { key: "short", label: "Below minimum" },
              { key: "critical", label: "Critical" }
            ],
            rows: byWh.map((w) => ({ warehouse: w.warehouse.name.split(" \xB7 ")[0], short: w.shortageCount, critical: w.criticalCount }))
          },
          {
            kind: "table",
            title: wh ? `Shortages \xB7 ${ds.warehouses.find((x) => x.id === wh)?.name}` : "Items below minimum stock",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "warehouse", label: "Warehouse" },
              { key: "criticality", label: "Criticality" },
              { key: "stock", label: "Stock", format: "number" },
              { key: "min", label: "Min", format: "number" },
              { key: "cover", label: "Cover", format: "days" },
              { key: "assets", label: "Needed for" }
            ],
            rows: list.map((r) => ({
              sku: r.item.id,
              name: r.item.name,
              warehouse: r.warehouseName.split(" \xB7 ")[0],
              criticality: r.item.criticality,
              stock: r.item.stock,
              min: r.item.minStock,
              cover: Number.isFinite(r.daysOfCover) ? r1(r.daysOfCover) : null,
              assets: r.linkedAssets.map((x) => x.id).join(", ") || "-"
            }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_overdue_maintenance",
      description: "Assets whose scheduled maintenance is overdue, plus assets due within 7 days. Optional site filter (Dubai, Riyadh, Dammam).",
      parameters: { type: "object", properties: { site: { type: "string" }, limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const site = matchSite(ds, a.site);
      const rows = overdueMaintenance(ds).filter((r) => !site || r.asset.site === site);
      const due = dueThisWeek(ds).filter((x) => !site || x.site === site);
      const list = rows.slice(0, limitOf(a, 15));
      return {
        data: {
          overdueCount: rows.length,
          dueWithin7Days: due.map((x) => ({ id: x.id, name: x.name, due: x.nextServiceDate })),
          overdue: list.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, criticality: r.asset.criticality, daysOverdue: r.daysOverdue, lastService: r.asset.lastServiceDate }))
        },
        visuals: [
          {
            kind: "hbar",
            title: "Days overdue",
            xKey: "asset",
            series: [{ key: "days", label: "Days overdue" }],
            format: "days",
            rows: list.map((r) => ({ asset: r.asset.id, days: r.daysOverdue }))
          },
          {
            kind: "table",
            title: "Overdue maintenance",
            columns: [
              { key: "id", label: "Asset" },
              { key: "name", label: "Name" },
              { key: "site", label: "Site" },
              { key: "criticality", label: "Criticality" },
              { key: "last", label: "Last service" },
              { key: "days", label: "Overdue", format: "days" }
            ],
            rows: list.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, criticality: r.asset.criticality, last: r.asset.lastServiceDate, days: r.daysOverdue }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_top_spend_items",
      description: "Items consuming the most procurement budget over the last 12 months.",
      parameters: { type: "object", properties: { limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const rows = topSpendItems(ds, limitOf(a, 10));
      const total = totalSpend12m(ds);
      return {
        data: { currency: "AED", totalSpend12m: r0(total), items: rows.map((r) => ({ sku: r.item.id, name: r.item.name, category: r.item.category, spend: r0(r.spend), shareOfTotal: r1(r.spend / total * 100) + "%" })) },
        visuals: [
          {
            kind: "hbar",
            title: `Top ${rows.length} items by procurement spend`,
            xKey: "item",
            series: [{ key: "spend", label: "Spend" }],
            format: "money",
            rows: rows.map((r) => ({ item: `${r.item.name} (${r.item.warehouseId.replace("WH-", "")})`, spend: r0(r.spend) }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_supplier_performance",
      description: "Supplier delivery performance: on-time rate, average delay in days, deliveries, open orders and spend. Sorted by worst delay.",
      parameters: { type: "object", properties: { limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const rows = supplierPerformance(ds).slice(0, limitOf(a, 10));
      const open = (id) => ds.purchaseOrders.filter((p) => p.supplierId === id && !p.deliveredDate).length;
      return {
        data: rows.map((s) => ({ supplier: s.supplier.name, country: s.supplier.country, onTimeRate: r1(s.onTimeRate * 100) + "%", avgDelayDays: r1(s.avgDelayDays), deliveries: s.orders, openOrders: open(s.supplier.id), spend12m: r0(s.spend) })),
        visuals: [
          {
            kind: "hbar",
            title: "Average delivery delay (days)",
            xKey: "supplier",
            series: [{ key: "delay", label: "Avg. delay" }],
            format: "days",
            rows: rows.map((s) => ({ supplier: s.supplier.name, delay: r1(s.avgDelayDays) }))
          },
          {
            kind: "table",
            title: "Supplier performance",
            columns: [
              { key: "supplier", label: "Supplier" },
              { key: "country", label: "Country" },
              { key: "ontime", label: "On time", format: "percent" },
              { key: "delay", label: "Avg. delay", format: "days" },
              { key: "open", label: "Open POs", format: "number" },
              { key: "spend", label: "Spend \xB7 12m", format: "money" }
            ],
            rows: rows.map((s) => ({ supplier: s.supplier.name, country: s.supplier.country, ontime: r1(s.onTimeRate * 100), delay: r1(s.avgDelayDays), open: open(s.supplier.id), spend: r0(s.spend) }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_repeat_inspection_failures",
      description: "Assets that failed inspection repeatedly in the last 12 months, with findings.",
      parameters: { type: "object", properties: { min_failures: { type: "number" } } }
    },
    run: (ds, a) => {
      const rows = repeatInspectionFailures(ds, Math.max(2, Number(a.min_failures) || 2));
      return {
        data: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, failures: r.failCount, findings: Array.from(new Set(r.findings)) })),
        visuals: [
          {
            kind: "table",
            title: "Repeated inspection failures (last 4 inspections)",
            columns: [
              { key: "id", label: "Asset" },
              { key: "name", label: "Name" },
              { key: "site", label: "Site" },
              { key: "fails", label: "Failures", format: "number" },
              { key: "findings", label: "Findings" }
            ],
            rows: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, fails: r.failCount, findings: Array.from(new Set(r.findings)).join("; ") }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "estimate_shortage_financial_impact",
      description: "Estimated financial impact of current stock shortages: replenishment cost plus downtime exposure for assets that need short parts. Optional warehouse filter.",
      parameters: { type: "object", properties: { warehouse: { type: "string" } } }
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      const rows = stockShortages(ds).filter((r) => !wh || r.item.warehouseId === wh);
      const detail = rows.map((r) => {
        const gapDays = Math.max(0, r.item.leadTimeDays - (Number.isFinite(r.daysOfCover) ? r.daysOfCover : 999));
        const downtime2 = r.linkedAssets.reduce((acc, asset) => acc + Math.min(gapDays, 3) * 8 * (DOWNTIME_AED_PER_HOUR[asset.criticality] ?? 0), 0);
        return { r, downtime: downtime2 };
      });
      const replenish = detail.reduce((s, d) => s + d.r.replenishCost, 0);
      const downtime = detail.reduce((s, d) => s + d.downtime, 0);
      const byWh = ds.warehouses.filter((w) => !wh || w.id === wh).map((w) => {
        const mine = detail.filter((d) => d.r.item.warehouseId === w.id);
        return { warehouse: w.name.split(" \xB7 ")[0], replenish: r0(mine.reduce((s, d) => s + d.r.replenishCost, 0)), downtime: r0(mine.reduce((s, d) => s + d.downtime, 0)) };
      });
      return {
        data: {
          currency: "AED",
          shortItems: rows.length,
          replenishmentCost: r0(replenish),
          downtimeExposure: r0(downtime),
          totalEstimatedImpact: r0(replenish + downtime),
          assumptions: "Downtime exposure = assets that need a short part \xD7 days the part arrives after stock runs out (capped at 3) \xD7 8 production hours \xD7 hourly downtime cost by criticality (Critical 18,000, High 9,000, Medium 3,500, Low 1,200 AED/h).",
          largestExposures: detail.filter((d) => d.downtime > 0).sort((x, y) => y.downtime - x.downtime).slice(0, 5).map((d) => ({ sku: d.r.item.id, item: d.r.item.name, assets: d.r.linkedAssets.map((x) => x.id), downtimeExposure: r0(d.downtime) }))
        },
        visuals: [
          {
            kind: "bar",
            title: "Shortage impact by warehouse (AED)",
            xKey: "warehouse",
            format: "money",
            series: [
              { key: "replenish", label: "Replenishment cost" },
              { key: "downtime", label: "Downtime exposure" }
            ],
            rows: byWh
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_asset_risk",
      description: "Assets ranked by risk score from vibration and pressure trend anomalies versus their own baseline.",
      parameters: { type: "object", properties: { limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const rows = riskiestAssets(ds, limitOf(a, 8));
      return {
        data: rows.map((r) => ({ id: r.asset.id, name: r.asset.name, site: r.asset.site, riskScore: r.risk, vibrationNow: r1(r.recent), vibrationBaseline: r1(r.baseline), runningHours: r.asset.runningHours })),
        visuals: [
          {
            kind: "hbar",
            title: "Asset risk score (0-100)",
            xKey: "asset",
            series: [{ key: "risk", label: "Risk score" }],
            rows: rows.map((r) => ({ asset: r.asset.name, risk: r.risk }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_excess_inventory",
      description: "Slow-moving and excess inventory above maximum stock, with capital tied up.",
      parameters: { type: "object", properties: { limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const rows = excessInventory(ds).slice(0, limitOf(a, 10));
      return {
        data: { currency: "AED", items: rows.map((r) => ({ sku: r.item.id, name: r.item.name, warehouse: r.item.warehouseId, excessUnits: r.excessUnits, tiedUpValue: r0(r.tiedUpValue), avgDailyUsage90d: r1(avgDailyUsage(r.item, 90)) })) },
        visuals: [
          {
            kind: "table",
            title: "Excess inventory",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "wh", label: "Warehouse" },
              { key: "excess", label: "Excess units", format: "number" },
              { key: "value", label: "Capital tied up", format: "money" }
            ],
            rows: rows.map((r) => ({ sku: r.item.id, name: r.item.name, wh: r.item.warehouseId.replace("WH-", "Warehouse "), excess: r.excessUnits, value: r0(r.tiedUpValue) }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_spend_analysis",
      description: "Procurement spend by month (last 12 complete months) and by category.",
      parameters: { type: "object", properties: {} }
    },
    run: (ds) => {
      const monthly = monthlySpend(ds);
      const cats = spendByCategory(ds);
      return {
        data: { currency: "AED", monthly: monthly.map((m) => ({ month: m.month, spend: m.spend })), byCategory: cats.slice(0, 10) },
        visuals: [
          { kind: "line", title: "Monthly procurement spend", xKey: "label", format: "money", series: [{ key: "spend", label: "Spend" }], rows: monthly.map((m) => ({ label: m.label, spend: m.spend })) },
          { kind: "pie", title: "Spend by category", xKey: "category", format: "money", series: [{ key: "spend", label: "Spend" }], rows: cats.slice(0, 8) }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_reorder_recommendations",
      description: "Demand forecast-based replenishment plan: items predicted to fall below minimum stock or run out, days until critical/stockout, recommended order quantity and value, order-by date. Optional warehouse filter or specific SKU / item name.",
      parameters: { type: "object", properties: { warehouse: { type: "string" }, item: { type: "string", description: "SKU or part of the item name" }, limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const wh = matchWarehouse(ds, a.warehouse);
      const q = typeof a.item === "string" ? a.item.toLowerCase() : "";
      const pool = q ? forecastAll(ds).filter((f) => f.item.id.toLowerCase() === q || f.item.name.toLowerCase().includes(q)) : reorderPlan(ds);
      const rows = pool.filter((f) => !wh || f.item.warehouseId === wh).slice(0, limitOf(a, 10));
      return {
        data: {
          currency: "AED",
          method: "Holt-Winters forecast on 12 months of daily consumption with weekly seasonality; order quantity covers lead time + 30 days plus safety stock, net of stock on order.",
          portfolioForecastAccuracy: r1(portfolioAccuracy(ds) * 100) + "%",
          items: rows.map((f) => ({
            sku: f.item.id,
            name: f.item.name,
            warehouse: f.item.warehouseId,
            stock: f.item.stock,
            minimum: f.item.minStock,
            avgDailyUse30d: r1(f.avgDaily30),
            forecastDailyUse30d: r1(f.forecastDaily30),
            onOrder: f.onOrder,
            daysUntilBelowMinimum: f.daysToCritical,
            daysUntilStockout: f.daysToStockout,
            recommendedQty: f.recommendedQty,
            recommendedValue: r0(f.recommendedCost),
            orderBy: f.orderBy,
            urgency: f.urgency
          }))
        },
        visuals: [
          {
            kind: "table",
            title: "Replenishment recommendations",
            columns: [
              { key: "sku", label: "SKU" },
              { key: "name", label: "Item" },
              { key: "stock", label: "Stock", format: "number" },
              { key: "crit", label: "Below min in", format: "days" },
              { key: "qty", label: "Order qty", format: "number" },
              { key: "value", label: "Value", format: "money" },
              { key: "by", label: "Order by" }
            ],
            rows: rows.map((f) => ({ sku: f.item.id, name: f.item.name, stock: f.item.stock, crit: f.daysToCritical, qty: f.recommendedQty, value: r0(f.recommendedCost), by: f.orderBy ?? "-" }))
          }
        ]
      };
    }
  },
  {
    type: "function",
    function: {
      name: "get_asset_health",
      description: "Predictive maintenance view: asset health and risk scores, status, risk drivers and projected days until vibration reaches the alarm limit. Optional asset id filter.",
      parameters: { type: "object", properties: { asset: { type: "string" }, limit: { type: "number" } } }
    },
    run: (ds, a) => {
      const q = typeof a.asset === "string" ? a.asset.toLowerCase() : "";
      const rows = fleetHealth(ds).filter((h2) => !q || h2.asset.id.toLowerCase() === q || h2.asset.name.toLowerCase().includes(q)).slice(0, limitOf(a, 8));
      return {
        data: rows.map((h2) => ({ id: h2.asset.id, name: h2.asset.name, site: h2.asset.site, healthScore: h2.healthScore, status: h2.status, daysToVibrationAlarm: h2.daysToAlarm, drivers: h2.drivers })),
        visuals: [
          {
            kind: "hbar",
            title: "Asset health score (100 = healthy)",
            xKey: "asset",
            series: [{ key: "health", label: "Health score" }],
            rows: rows.map((h2) => ({ asset: h2.asset.name, health: h2.healthScore }))
          }
        ]
      };
    }
  }
];
var TOOL_DEFS = TOOLS.map(({ type, function: f }) => ({ type, function: f }));
var FOLLOW_UPS = {
  get_business_overview: ["Which warehouse has the biggest shortage?", "Which assets are most at risk?"],
  get_stock_shortages: ["What is the financial impact of these shortages?", "Which of these parts are needed this week?"],
  get_overdue_maintenance: ["Do we have the parts for these assets?", "Which assets have repeated inspection failures?"],
  get_top_spend_items: ["Show spend by category", "Which suppliers are delaying deliveries?"],
  get_supplier_performance: ["Which open orders are at risk of arriving late?", "Top 10 items by procurement spend"],
  get_repeat_inspection_failures: ["Which assets have overdue maintenance?", "Show asset risk scores"],
  estimate_shortage_financial_impact: ["Which parts should we reorder first?", "Which suppliers supply these parts?"],
  get_asset_risk: ["Do we have spare parts for the riskiest assets?", "Which assets have overdue maintenance?"],
  get_excess_inventory: ["How much capital is tied up in excess stock per warehouse?", "Which items are short?"],
  get_spend_analysis: ["Top 10 items by procurement spend", "Which suppliers have the highest delays?"],
  get_reorder_recommendations: ["What is the total value of orders needed this week?", "Which of these suppliers are delivering late?"],
  get_asset_health: ["Do we have spare parts for these assets?", "Which assets have overdue maintenance?"]
};
function systemPrompt(ds) {
  return `You are SCIO, the AI operations copilot inside SCIO, a unified business operating system.
Today is ${ds.anchorDate}. Currency is AED. Warehouses: ${ds.warehouses.map((w) => `${w.id.replace("WH-", "")} = ${w.name} (${w.city})`).join("; ")}.

Rules:
- ALWAYS call one or more tools to get data before answering any business question. Never guess or invent numbers.
- Use only figures returned by tools; never invent numbers.
- Never refuse or say "I do not have access". For broader business questions (sales growth, revenue, customers, strategy) give practical, specific advice: connect it to the operational levers you can measure (downtime limiting output and on-time delivery, spare-parts shortages, supplier delays, excess inventory freeing cash) using tool figures, add proven business practices, and mention that store sales, margin and basket analytics are in the Retail workspace (Retail \u2192 Ask SCIO or Master Dashboard).
- Answer for a busy manager: start with a one-sentence direct answer, then 2-5 short bullet points with the key figures (use **bold** for numbers), then a line starting with "Recommendation:" giving a concrete next action grounded in the data.
- Charts and tables are shown to the user automatically from the tool results, so do not reproduce long tables; refer to them briefly.
- For estimates, mention the key assumption in one short clause.
- Keep answers under 170 words. Use plain business English.`;
}
async function runCopilot(question, history, token) {
  const ds = await getIndustrialData2(token);
  const messages = [
    { role: "system", content: systemPrompt(ds) },
    ...history.slice(-8).map((t) => ({ role: t.role, content: t.content.slice(0, 2e3) })),
    { role: "user", content: question.slice(0, 1e3) }
  ];
  const visuals = [];
  const toolsUsed = [];
  for (let step = 0; step < 4; step++) {
    const { message: message2 } = await sarvamChat({ messages, tools: TOOL_DEFS, maxTokens: 900 });
    const calls = message2.tool_calls ?? [];
    if (!calls.length) {
      return {
        answer: (message2.content ?? "").trim() || "I couldn't produce an answer for that. Try rephrasing the question.",
        visuals,
        toolsUsed,
        followUps: Array.from(new Set(toolsUsed.flatMap((t) => FOLLOW_UPS[t] ?? []))).slice(0, 3)
      };
    }
    messages.push({ role: "assistant", content: message2.content ?? null, tool_calls: calls });
    for (const call of calls) {
      const tool = TOOLS.find((t) => t.function.name === call.function.name);
      let args = {};
      try {
        args = JSON.parse(call.function.arguments || "{}");
      } catch {
      }
      let content;
      if (!tool) content = JSON.stringify({ error: `Unknown tool ${call.function.name}` });
      else {
        const res = tool.run(ds, args);
        if (!toolsUsed.includes(tool.function.name)) {
          toolsUsed.push(tool.function.name);
          visuals.push(...res.visuals);
        }
        content = JSON.stringify(res.data);
      }
      messages.push({ role: "tool", tool_call_id: call.id, content });
    }
  }
  const { message } = await sarvamChat({ messages, maxTokens: 900 });
  return {
    answer: (message.content ?? "").trim(),
    visuals,
    toolsUsed,
    followUps: Array.from(new Set(toolsUsed.flatMap((t) => FOLLOW_UPS[t] ?? []))).slice(0, 3)
  };
}

// src/demo/retail/state.ts
var DEFAULT_THRESHOLDS = { stockoutDays: 3, overstockDays: 90, expiryDays: 15, phantomDays: 5, markdownPct: 30, targetDays: 14 };
function buildState(base, events) {
  const ohDelta = /* @__PURE__ */ new Map();
  const dcDelta = /* @__PURE__ */ new Map();
  const inboundStore = /* @__PURE__ */ new Map();
  const inboundDc = /* @__PURE__ */ new Map();
  const lastSaleOverride = /* @__PURE__ */ new Map();
  const add = (m, key, v2) => m.set(key, (m.get(key) ?? 0) + v2);
  const thresholds = { ...DEFAULT_THRESHOLDS };
  const poStatus = /* @__PURE__ */ new Map();
  const poReceived = /* @__PURE__ */ new Map();
  const newPos = [];
  const transfers = /* @__PURE__ */ new Map();
  const counts = /* @__PURE__ */ new Map();
  const markdowns = /* @__PURE__ */ new Map();
  const tickets = new Map(base.tickets.map((t) => [t.id, { ...t }]));
  const taskStatus = /* @__PURE__ */ new Map();
  const alertStatus = /* @__PURE__ */ new Map();
  const fixedPrices = /* @__PURE__ */ new Set();
  const baseOh = (p) => base.onHand[p] + (ohDelta.get(p) ?? 0);
  const today = base.anchorDate;
  for (const e of events) {
    switch (e.type) {
      case "transfer_create":
        transfers.set(e.transferId, { id: e.transferId, skuIdx: e.skuIdx, from: e.from, toStore: e.toStore, qty: e.qty, reason: e.reason, status: "Requested", created: e.at, createdBy: e.user, alertId: e.alertId });
        break;
      case "transfer_approve": {
        const t = transfers.get(e.transferId);
        if (!t || t.status !== "Requested") break;
        t.status = "Approved \xB7 in transit";
        if (t.from.type === "store") add(ohDelta, t.from.idx * NSKU + t.skuIdx, -t.qty);
        else add(dcDelta, t.from.idx * NSKU + t.skuIdx, -t.qty);
        add(inboundStore, t.toStore * NSKU + t.skuIdx, t.qty);
        break;
      }
      case "transfer_receive": {
        const t = transfers.get(e.transferId);
        if (!t || t.status !== "Approved \xB7 in transit") break;
        t.status = "Received";
        const p = t.toStore * NSKU + t.skuIdx;
        add(inboundStore, p, -t.qty);
        add(ohDelta, p, t.qty);
        lastSaleOverride.set(p, 0);
        break;
      }
      case "transfer_cancel": {
        const t = transfers.get(e.transferId);
        if (t && t.status === "Requested") t.status = "Cancelled";
        break;
      }
      case "po_create":
        newPos.push({
          id: e.poId,
          supplierIdx: e.supplierIdx,
          destType: e.destType,
          destIdx: e.destIdx,
          created: e.at.slice(0, 10),
          promised: addDaysIso(today, e.leadDays),
          received: null,
          status: "Pending approval",
          lines: e.lines.map((l) => ({ skuIdx: l.skuIdx, ordered: l.qty, received: 0, unitCost: l.unitCost, invoicedQty: null, invoicedCost: null })),
          createdBy: e.user,
          grn: null,
          asn: null,
          flow: e.destType === "store" ? "Direct to store" : "Putaway"
        });
        break;
      case "po_approve":
        poStatus.set(e.poId, "Sent");
        break;
      case "po_receive": {
        const rec = poReceived.get(e.poId) ?? /* @__PURE__ */ new Map();
        for (const l of e.lines) rec.set(l.skuIdx, (rec.get(l.skuIdx) ?? 0) + l.qty);
        poReceived.set(e.poId, rec);
        break;
      }
      case "markdown":
        markdowns.set(e.storeIdx * NSKU + e.skuIdx, { storeIdx: e.storeIdx, skuIdx: e.skuIdx, lot: e.lot, pct: e.pct, at: e.at, by: e.user });
        break;
      case "count_start": {
        const p = e.storeIdx * NSKU + e.skuIdx;
        counts.set(e.countId, { id: e.countId, storeIdx: e.storeIdx, skuIdx: e.skuIdx, systemQty: baseOh(p), counted: null, status: "Counting", variance: null, created: e.at, createdBy: e.user });
        break;
      }
      case "count_complete": {
        const c = counts.get(e.countId);
        if (!c || c.status !== "Counting") break;
        const p = c.storeIdx * NSKU + c.skuIdx;
        const current = baseOh(p);
        c.counted = e.counted;
        c.variance = e.counted - current;
        c.status = "Reconciled";
        add(ohDelta, p, e.counted - current);
        lastSaleOverride.set(p, 0);
        break;
      }
      case "ticket_create":
        tickets.set(e.ticketId, { id: e.ticketId, equipmentId: e.equipmentId, storeIdx: e.storeIdx, issue: e.issue, priority: e.priority, status: "Open", technician: null, created: e.at.slice(0, 10), resolved: null });
        break;
      case "ticket_assign": {
        const t = tickets.get(e.ticketId);
        if (t) {
          t.technician = e.technician;
          if (t.status === "Open") t.status = "Assigned";
        }
        break;
      }
      case "ticket_status": {
        const t = tickets.get(e.ticketId);
        if (t) {
          t.status = e.status;
          if (e.status === "Resolved") t.resolved = e.at.slice(0, 10);
        }
        break;
      }
      case "alert_status":
        alertStatus.set(e.alertId, { status: e.status, at: e.at, by: e.user, note: e.note });
        break;
      case "task_status":
        taskStatus.set(e.taskId, e.status);
        break;
      case "price_fix":
        fixedPrices.add(e.exceptionId);
        break;
      case "thresholds":
        Object.assign(thresholds, e.values);
        break;
    }
  }
  const pos = [...base.pos, ...newPos].map((po) => {
    const status = poStatus.get(po.id) ?? po.status;
    const rec = poReceived.get(po.id);
    const lines = rec ? po.lines.map((l) => ({ ...l, received: l.received + (rec.get(l.skuIdx) ?? 0), invoicedQty: l.invoicedQty, invoicedCost: l.invoicedCost })) : po.lines;
    let finalStatus = status;
    if (rec) finalStatus = lines.every((l) => l.received >= l.ordered) ? "Received" : "Partially received";
    return { ...po, status: finalStatus, lines, received: rec ? today : po.received, grn: po.grn ?? (rec ? `GRN-${po.id.replace(/\D/g, "")}` : null) };
  });
  for (const po of pos) {
    const open = po.status === "Sent" || po.status === "Approved" || po.status === "Pending approval" || po.status === "Partially received" && po.received === today;
    const rec = poReceived.get(po.id);
    for (const l of po.lines) {
      const key = po.destIdx * NSKU + l.skuIdx;
      const r = rec?.get(l.skuIdx) ?? 0;
      if (r) {
        if (po.destType === "store") {
          add(ohDelta, key, r);
          lastSaleOverride.set(key, 0);
        } else add(dcDelta, key, r);
      }
      if (open && po.status !== "Pending approval") {
        const outstanding = Math.max(0, l.ordered - l.received);
        if (po.destType === "store") add(inboundStore, key, outstanding);
        else add(inboundDc, key, outstanding);
      }
    }
  }
  const tasks = base.tasks.map((t) => taskStatus.has(t.id) ? { ...t, status: taskStatus.get(t.id) } : t);
  return {
    base,
    events,
    thresholds,
    onHand: (p) => Math.max(0, base.onHand[p] + (ohDelta.get(p) ?? 0)),
    dcOnHand: (d, k) => Math.max(0, base.dcStock[d * NSKU + k] + (dcDelta.get(d * NSKU + k) ?? 0)),
    inbound: (p) => Math.max(0, inboundStore.get(p) ?? 0),
    dcInbound: (d, k) => Math.max(0, inboundDc.get(d * NSKU + k) ?? 0),
    lastSale: (p) => lastSaleOverride.get(p) ?? base.lastSaleDaysAgo[p],
    pos: pos.sort((a, b) => b.created.localeCompare(a.created)),
    transfers: Array.from(transfers.values()).reverse(),
    counts: Array.from(counts.values()).reverse(),
    markdowns,
    tickets: Array.from(tickets.values()).sort((a, b) => b.created.localeCompare(a.created)),
    tasks,
    alertStatus,
    fixedPrices,
    version: events.length
  };
}

// src/demo/retail/analytics.ts
var inScope = (scope, s) => !scope || scope.has(s);
var r12 = (n) => Math.round(n * 10) / 10;
function available(st, p) {
  return Math.max(0, st.onHand(p) - st.base.reserved[p] - st.base.damaged[p]);
}
function stockoutRisks(st, scope = null) {
  const { base, thresholds: t } = st;
  const out = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const v2 = base.velocity[p];
      if (v2 < 0.25) continue;
      const avail = available(st, p);
      const inbound = st.inbound(p);
      const dos = avail / v2;
      if (dos > t.stockoutDays || avail + inbound >= v2 * t.stockoutDays * 2) continue;
      const sku = base.skus[k];
      const needQty = Math.max(1, Math.ceil(v2 * t.targetDays - avail - inbound));
      out.push({
        id: `so-${s.idx}-${k}`,
        storeIdx: s.idx,
        skuIdx: k,
        available: avail,
        velocity: v2,
        daysOfSupply: dos,
        inbound,
        outOfStock: avail === 0,
        lostSalesPerDay: v2 * sku.price,
        needQty: sku.baseUom === "kg" ? needQty : Math.ceil(needQty),
        donor: findDonor(st, s, k, needQty)
      });
    }
  }
  return out.sort((a, b) => Number(b.outOfStock) - Number(a.outOfStock) || b.lostSalesPerDay - a.lostSalesPerDay);
}
function findDonor(st, to, k, need) {
  const { base } = st;
  let best = null;
  for (const s of base.stores) {
    if (s.idx === to.idx || s.country !== to.country) continue;
    const p = s.idx * NSKU + k;
    if (!base.carried[p]) continue;
    const v2 = Math.max(base.velocity[p], 0.05);
    const avail = available(st, p);
    const keep = v2 * 21;
    const surplus = Math.floor(avail - keep);
    if (surplus < Math.min(need, 2)) continue;
    const sameCity = s.city === to.city ? 2 : s.region === to.region ? 1 : 0;
    const score = sameCity * 1e3 + surplus;
    const qty = Math.min(need, surplus);
    if (!best || score > best._score) best = Object.assign({ type: "store", idx: s.idx, available: avail, daysOfSupply: avail / v2, qty }, { _score: score });
  }
  if (best) return best;
  const dcAvail = st.dcOnHand(to.dcIdx, k);
  if (dcAvail >= Math.min(need, 1)) return { type: "dc", idx: to.dcIdx, available: dcAvail, daysOfSupply: 0, qty: Math.min(need, dcAvail) };
  return null;
}
function overstock(st, scope = null) {
  const { base, thresholds: t } = st;
  const out = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const v2 = Math.max(base.velocity[p], 0.02);
      const oh = st.onHand(p);
      const dos = oh / v2;
      if (dos < t.overstockDays) continue;
      const excessUnits = Math.floor(oh - v2 * 30);
      const excessValue = excessUnits * base.skus[k].cost;
      if (excessValue < 1e3) continue;
      out.push({ id: `os-${s.idx}-${k}`, storeIdx: s.idx, skuIdx: k, onHand: oh, velocity: v2, daysOfSupply: dos, excessUnits, excessValue });
    }
  }
  return out.sort((a, b) => b.excessValue - a.excessValue);
}
function phantomInventory(st, scope = null) {
  const { base, thresholds: t } = st;
  const out = [];
  const counting = new Set(st.counts.filter((c) => c.status === "Counting").map((c) => c.storeIdx * NSKU + c.skuIdx));
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p] || base.velocity[p] < 1) continue;
      const oh = st.onHand(p);
      const last = st.lastSale(p);
      if (oh <= 0 || last < t.phantomDays || counting.has(p)) continue;
      out.push({ id: `ph-${s.idx}-${k}`, storeIdx: s.idx, skuIdx: k, systemQty: oh, velocity: base.velocity[p], daysNoSale: last, expectedSalesLost: base.velocity[p] * last * base.skus[k].price });
    }
  }
  return out.sort((a, b) => b.expectedSalesLost - a.expectedSalesLost);
}
function expiryRisks(st, scope = null) {
  const { base, thresholds: t } = st;
  const out = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) {
      const sku = base.skus[k];
      if (!sku.perishable) continue;
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      const oh = st.onHand(p);
      const quick = oldestBatchQuick(base, s.idx, k, oh);
      if (!quick || quick.daysLeft > t.expiryDays) continue;
      const md0 = st.markdowns.get(p);
      if (!md0 && quick.qty <= base.velocity[p] * quick.daysLeft) continue;
      const b = batchesFor(base, s.idx, k, oh)[0];
      const md = st.markdowns.get(p);
      const uplift = md ? 1 + md.pct / 100 * 3 : 1;
      const v2 = base.velocity[p] * uplift;
      const expectedToSell = v2 * b.daysLeft;
      const atRisk = Math.floor(b.qty - expectedToSell);
      if (atRisk <= 0 && !md) continue;
      let transferTo = null;
      let bestV = base.velocity[p] * 1.4;
      for (const o of base.stores) {
        if (o.idx === s.idx || o.city !== s.city) continue;
        const q = o.idx * NSKU + k;
        if (!base.carried[q]) continue;
        if (base.velocity[q] > bestV && st.onHand(q) < base.velocity[q] * 4) {
          bestV = base.velocity[q];
          transferTo = o.idx;
        }
      }
      out.push({
        id: `ex-${s.idx}-${k}`,
        storeIdx: s.idx,
        skuIdx: k,
        lot: b.lot,
        qty: b.qty,
        daysLeft: b.daysLeft,
        expiry: b.expiry,
        expectedToSell: r12(expectedToSell),
        atRiskUnits: Math.max(0, atRisk),
        atRiskValue: Math.max(0, atRisk) * sku.cost,
        recommendation: transferTo !== null && b.daysLeft >= 3 ? "transfer" : "markdown",
        transferTo,
        markedDown: md ? md.pct : null
      });
    }
  }
  return out.sort((a, b) => b.atRiskValue - a.atRiskValue);
}
function supplierDelays(st, scope = null) {
  const { base } = st;
  const today = base.anchorDate;
  const out = [];
  for (const po of st.pos) {
    if (po.status !== "Sent" && po.status !== "Approved") continue;
    if (po.promised >= today) continue;
    const daysLate = Math.round((new Date(today).getTime() - new Date(po.promised).getTime()) / 864e5);
    const servedStores = po.destType === "store" ? [po.destIdx] : base.stores.filter((s) => s.dcIdx === po.destIdx).map((s) => s.idx);
    const affectedSkus = po.lines.map((l) => l.skuIdx);
    const affectedStores = servedStores.filter((s) => inScope(scope, s) && affectedSkus.some((k) => {
      const p = s * NSKU + k;
      return base.carried[p] && available(st, p) < base.velocity[p] * 7;
    }));
    if (scope && !servedStores.some((s) => scope.has(s))) continue;
    out.push({
      id: `sd-${po.id}`,
      poId: po.id,
      supplierIdx: po.supplierIdx,
      destType: po.destType,
      destIdx: po.destIdx,
      daysLate,
      lines: po.lines.length,
      value: po.lines.reduce((s, l) => s + (l.ordered - l.received) * l.unitCost, 0),
      affectedSkus,
      affectedStores
    });
  }
  return out.sort((a, b) => b.affectedStores.length - a.affectedStores.length || b.daysLate - a.daysLate);
}
function equipmentIssues(st, scope = null) {
  const { base } = st;
  const out = [];
  for (const e of base.equipment) {
    if (!e.fault || !inScope(scope, e.storeIdx)) continue;
    const ticket = st.tickets.find((t) => t.equipmentId === e.id && t.status !== "Resolved") ?? null;
    const resolved = st.tickets.find((t) => t.equipmentId === e.id && t.status === "Resolved" && t.created >= base.anchorDate);
    if (resolved && !ticket) continue;
    const cold = e.type === "Freezer" || e.type === "Chiller" || e.type === "Cold Room";
    let coldValue = 0;
    if (cold) {
      for (let k = 0; k < NSKU; k++) {
        const sku = base.skus[k];
        if (e.type === "Freezer" && sku.department === "Frozen" || e.type !== "Freezer" && (sku.category === "Dairy & Eggs" || sku.category === "Meat & Poultry")) {
          coldValue += st.onHand(e.storeIdx * NSKU + k) * sku.cost;
        }
      }
      const units = base.equipment.filter((x) => x.storeIdx === e.storeIdx && (e.type === "Freezer" ? x.type === "Freezer" : x.type === "Chiller" || x.type === "Cold Room")).length || 1;
      coldValue /= units;
    }
    out.push({
      id: `eq-${e.id}`,
      equipment: e,
      storeIdx: e.storeIdx,
      severity: cold || e.type === "HVAC" ? "critical" : "high",
      latest: e.readings[e.readings.length - 1],
      ticketId: ticket?.id ?? null,
      ticketStatus: ticket?.status ?? null,
      stockAtRiskValue: coldValue
    });
  }
  return out.sort((a, b) => b.stockAtRiskValue - a.stockAtRiskValue);
}
function storePerformance(st, scope = null) {
  const { base } = st;
  const out = [];
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    let sales = 0;
    let lost = 0;
    let carried = 0;
    let oos = 0;
    let inv = 0;
    let shrink = 0;
    for (let k = 0; k < NSKU; k++) {
      const p = s.idx * NSKU + k;
      if (!base.carried[p]) continue;
      carried++;
      const sku = base.skus[k];
      const v2 = base.velocity[p];
      const oh = st.onHand(p);
      const noSale = Math.min(30, st.lastSale(p));
      sales += v2 * sku.price * (30 - noSale);
      lost += v2 * sku.price * noSale;
      if (available(st, p) === 0 && v2 >= 0.25) oos++;
      inv += oh * sku.cost;
      shrink += base.damaged[p] * sku.cost;
    }
    const audits = base.audits.filter((a) => a.storeIdx === s.idx);
    out.push({
      store: s,
      sales30: sales,
      target: s.monthlyTargetAed,
      vsTarget: sales / s.monthlyTargetAed,
      availability: carried ? 1 - oos / carried : 1,
      carried,
      outOfStock: oos,
      lostSales30: lost,
      inventoryValue: inv,
      shrinkValue: shrink,
      openTasks: st.tasks.filter((t) => t.storeIdx === s.idx && t.status !== "Done").length,
      pricingExceptions: base.pricingExceptions.filter((x) => x.storeIdx === s.idx && !st.fixedPrices.has(x.id)).length,
      auditScore: audits.length ? audits.reduce((a, x) => a + x.score, 0) / audits.length : 100,
      equipmentFaults: base.equipment.filter((e) => e.storeIdx === s.idx && e.fault && !st.tickets.some((t) => t.equipmentId === e.id && t.status === "Resolved")).length
    });
  }
  return out;
}
function retailKpis(st, scope = null) {
  const { base } = st;
  const perf = storePerformance(st, scope);
  const so = stockoutRisks(st, scope);
  const ov = overstock(st, scope);
  const ex = expiryRisks(st, scope);
  const ph = phantomInventory(st, scope);
  const sd2 = supplierDelays(st, scope);
  let active = 0;
  const seen = new Uint8Array(NSKU);
  for (const s of base.stores) {
    if (!inScope(scope, s.idx)) continue;
    for (let k = 0; k < NSKU; k++) if (base.carried[s.idx * NSKU + k] && !seen[k] && base.skus[k].status !== "Discontinued") {
      seen[k] = 1;
      active++;
    }
  }
  const sales = perf.reduce((a, p) => a + p.sales30, 0);
  const target = perf.reduce((a, p) => a + p.target, 0);
  return {
    stores: perf.length,
    activeSkus: active,
    inventoryValue: perf.reduce((a, p) => a + p.inventoryValue, 0),
    stockoutRisks: so.length,
    outOfStock: so.filter((x) => x.outOfStock).length,
    lostSalesPerDay: so.reduce((a, x) => a + (x.outOfStock ? x.lostSalesPerDay : 0), 0),
    overstockValue: ov.reduce((a, x) => a + x.excessValue, 0),
    overstockCount: ov.length,
    supplierDelays: sd2.length,
    expiryRiskValue: ex.filter((e) => !e.markedDown).reduce((a, x) => a + x.atRiskValue, 0),
    expiryCount: ex.filter((e) => !e.markedDown).length,
    phantomCount: ph.length,
    inventoryLoss: perf.reduce((a, p) => a + p.shrinkValue, 0) + ex.reduce((a, x) => a + (x.daysLeft <= 2 && !x.markedDown ? x.atRiskValue : 0), 0) + ph.reduce((a, x) => a + x.systemQty * base.skus[x.skuIdx].cost * 0.5, 0),
    sales30: sales,
    salesVsTarget: target ? sales / target : 1,
    availability: perf.length ? perf.reduce((a, p) => a + p.availability, 0) / perf.length : 1,
    perf,
    so,
    ov,
    ex,
    ph,
    sd: sd2
  };
}
function storeDiagnosis(st, storeIdx) {
  const { base } = st;
  const perf = storePerformance(st);
  const me = perf.find((p) => p.store.idx === storeIdx);
  const peers = perf.filter((p) => p.store.region === me.store.region && p.store.idx !== storeIdx);
  const avg = (f) => peers.length ? peers.reduce((a, p) => a + f(p), 0) / peers.length : f(me);
  const so = stockoutRisks(st, /* @__PURE__ */ new Set([storeIdx]));
  const oos = so.filter((x) => x.outOfStock);
  const byCat = /* @__PURE__ */ new Map();
  for (const x of oos) {
    const c = base.skus[x.skuIdx].category;
    const e = byCat.get(c) ?? { lost: 0, count: 0 };
    e.lost += x.lostSalesPerDay;
    e.count++;
    byCat.set(c, e);
  }
  const faults = equipmentIssues(st, /* @__PURE__ */ new Set([storeIdx]));
  const prices = base.pricingExceptions.filter((x) => x.storeIdx === storeIdx && !st.fixedPrices.has(x.id));
  const audits = base.audits.filter((a) => a.storeIdx === storeIdx).sort((a, b) => a.score - b.score);
  const delays = supplierDelays(st, /* @__PURE__ */ new Set([storeIdx])).filter((d) => d.affectedStores.includes(storeIdx));
  return {
    perf: me,
    peerAvg: { availability: avg((p) => p.availability), vsTarget: avg((p) => p.vsTarget), auditScore: avg((p) => p.auditScore), lostSales30: avg((p) => p.lostSales30) },
    topOos: oos.slice(0, 12),
    oosByCategory: Array.from(byCat, ([category, v2]) => ({ category, ...v2 })).sort((a, b) => b.lost - a.lost),
    faults,
    pricingExceptions: prices,
    lowAudits: audits.slice(0, 4),
    supplierDelays: delays
  };
}
function transferRecommendations(st, scope = null) {
  const pending = new Set(st.transfers.filter((t) => t.status !== "Cancelled" && t.status !== "Received").map((t) => `${t.toStore}-${t.skuIdx}`));
  return stockoutRisks(st, scope).filter((x) => x.donor && !pending.has(`${x.storeIdx}-${x.skuIdx}`));
}
function supplierScorecards(st) {
  const { base } = st;
  const today = base.anchorDate;
  const skuCount = /* @__PURE__ */ new Map();
  base.skus.forEach((s) => skuCount.set(s.supplierIdx, (skuCount.get(s.supplierIdx) ?? 0) + 1));
  return base.suppliers.map((s) => {
    const mine = st.pos.filter((p) => p.supplierIdx === s.idx);
    const done = mine.filter((p) => p.received);
    const onTime = done.filter((p) => p.received <= p.promised).length;
    const ordered = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.ordered, 0), 0);
    const received = done.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.received, 0), 0);
    const delays = done.map((p) => Math.max(0, (new Date(p.received).getTime() - new Date(p.promised).getTime()) / 864e5));
    const open = mine.filter((p) => !p.received && p.status !== "Cancelled");
    const late = open.filter((p) => p.promised < today && p.status !== "Pending approval");
    const issues = done.reduce((a, p) => a + p.lines.filter((l) => (l.invoicedCost ?? l.unitCost) > l.unitCost * 1.01 || (l.invoicedQty ?? 0) > l.received).length, 0);
    const onTimeRate = done.length ? onTime / done.length : 1;
    const fillRate = ordered ? received / ordered : 1;
    const avgDelay = delays.length ? delays.reduce((a, b) => a + b, 0) / delays.length : 0;
    return {
      idx: s.idx,
      pos: mine.length,
      openPos: open.length,
      latePos: late.length,
      onTimeRate,
      fillRate,
      avgDelayDays: avgDelay,
      spend: mine.reduce((a, p) => a + p.lines.reduce((x, l) => x + l.ordered * l.unitCost, 0), 0),
      invoiceIssues: issues,
      skuCount: skuCount.get(s.idx) ?? 0,
      riskScore: Math.round(Math.min(100, (1 - onTimeRate) * 60 + (1 - fillRate) * 120 + Math.min(avgDelay, 8) * 3 + late.length * 4))
    };
  });
}

// src/demo/retail/metrics.ts
var inScope2 = (scope, s) => !scope || scope.has(s);
var SQFT_PER_SQM = 10.7639;
function totals(rows, days) {
  let gross = 0, discounts = 0, returns = 0, net = 0, cogs = 0, txns = 0, units = 0, footfall = 0, lyNet = 0;
  for (const d of rows) {
    gross += d.grossSales;
    discounts += d.discounts;
    returns += d.returns;
    net += d.netSales;
    cogs += d.cogs;
    txns += d.transactions;
    units += d.units;
    footfall += d.footfall;
    lyNet += d.lyNetSales;
  }
  const gm = net - cogs;
  return {
    gross,
    discounts,
    returns,
    net,
    cogs,
    gm,
    gmPct: net ? gm / net : 0,
    txns,
    units,
    footfall,
    atv: txns ? net / txns : 0,
    upt: txns ? units / txns : 0,
    asp: units ? net / units : 0,
    conversion: footfall ? txns / footfall : 0,
    lyNet,
    lfl: lyNet ? net / lyNet - 1 : 0,
    discountRate: gross ? discounts / gross : 0,
    days
  };
}
function windowRows(st, scope, days, endOffset = 0, storeIdx) {
  const to = addDaysIso(st.base.anchorDate, -endOffset);
  const from = addDaysIso(to, -days);
  return st.base.storeDays.filter((d) => d.date > from && d.date <= to && inScope2(scope, d.storeIdx) && (storeIdx === void 0 || d.storeIdx === storeIdx));
}
function salesTotals(st, scope, days = 30, endOffset = 0, storeIdx) {
  return totals(windowRows(st, scope, days, endOffset, storeIdx), days);
}
function salesPrev(st, scope, days = 30, storeIdx) {
  return salesTotals(st, scope, days, days, storeIdx);
}
function salesByStore(st, scope, days = 30) {
  const by = /* @__PURE__ */ new Map();
  for (const d of windowRows(st, scope, days)) {
    const a = by.get(d.storeIdx) ?? [];
    a.push(d);
    by.set(d.storeIdx, a);
  }
  return [...by.entries()].map(([storeIdx, rows]) => {
    const t = totals(rows, days);
    const store = st.base.stores[storeIdx];
    return { storeIdx, store, ...t, salesPerSqft: t.net / (store.sizeSqm * SQFT_PER_SQM) };
  });
}
function upcomingEvents(st, scope, days = 45) {
  const countries = new Set(st.base.stores.filter((s) => inScope2(scope, s.idx)).map((s) => s.country));
  const to = addDaysIso(st.base.anchorDate, days);
  return st.base.calendar.filter((e) => e.end >= st.base.anchorDate && e.start <= to && e.countries.some((c) => countries.has(c)));
}

// src/server/demo/retailCopilot.ts
var r02 = (n) => Math.round(n);
var r13 = (n) => Math.round(n * 10) / 10;
var lim = (a, d = 10, m = 25) => Math.min(m, Math.max(1, Number(a.limit) || d));
function findStore(st, q) {
  if (typeof q !== "string" || !q.trim()) return null;
  const s = q.toLowerCase().replace(/store/g, "").trim();
  const num2 = s.match(/\d{3}/)?.[0];
  if (num2) {
    const hit = st.base.stores.find((x) => x.id === `S${num2}`);
    if (hit) return hit.idx;
  }
  return st.base.stores.find((x) => x.name.toLowerCase().includes(s) || x.city.toLowerCase() === s)?.idx ?? null;
}
function countryScope(st, c, base) {
  if (typeof c !== "string" || !c.trim()) return base;
  const q = c.toLowerCase();
  const country = st.base.countries.find((x) => x.code.toLowerCase() === q || x.name.toLowerCase().includes(q) || q === "ksa" && x.code === "SA" || q === "uae" && x.code === "AE");
  if (!country) return base;
  return new Set(st.base.stores.filter((s) => s.country === country.code && (!base || base.has(s.idx))).map((s) => s.idx));
}
var sname = (st, s) => `${st.base.stores[s].id} ${st.base.stores[s].name}`;
function tools(st, scope) {
  const { base } = st;
  return [
    {
      type: "function",
      function: { name: "get_retail_overview", description: "Chain KPIs: stores, active SKUs, inventory value, stockouts, overstock, supplier delays, expiry risk, losses, sales vs target and the top problems.", parameters: { type: "object", properties: {} } },
      run: () => {
        const k = retailKpis(st, scope);
        return {
          data: { currency: "AED", stores: k.stores, activeSkus: k.activeSkus, inventoryValue: r02(k.inventoryValue), outOfStockStoreSkus: k.outOfStock, stockoutRisks: k.stockoutRisks, lostSalesPerDay: r02(k.lostSalesPerDay), overstockValue: r02(k.overstockValue), overdueSupplierPOs: k.supplierDelays, expiryRiskValue: r02(k.expiryRiskValue), phantomRecords: k.phantomCount, sales30: r02(k.sales30), salesVsTarget: r13(k.salesVsTarget * 100) + "%", availability: r13(k.availability * 100) + "%" },
          visuals: []
        };
      }
    },
    {
      type: "function",
      function: {
        name: "get_stockout_forecast",
        description: "Stores and SKUs that will run out of stock within N days (default 7), with lost sales and whether a transfer source exists. Optional country or store filter.",
        parameters: { type: "object", properties: { days: { type: "number" }, country: { type: "string" }, store: { type: "string" }, limit: { type: "number" } } }
      },
      run: (a) => {
        const days = Math.min(30, Math.max(1, Number(a.days) || 7));
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? /* @__PURE__ */ new Set([sIdx]) : countryScope(st, a.country, scope);
        const rows = [];
        for (const s of base.stores) {
          if (sc && !sc.has(s.idx)) continue;
          for (let k = 0; k < NSKU; k++) {
            const p = s.idx * NSKU + k;
            if (!base.carried[p] || base.velocity[p] < 0.25) continue;
            const avail = Math.max(0, st.onHand(p) - base.reserved[p] - base.damaged[p]) + st.inbound(p);
            const dos = avail / base.velocity[p];
            if (dos <= days) rows.push({ s: s.idx, k, dos, lost: base.velocity[p] * base.skus[k].price, donor: false });
          }
        }
        const byStore = /* @__PURE__ */ new Map();
        for (const r of rows) {
          const e = byStore.get(r.s) ?? { count: 0, lost: 0 };
          e.count++;
          e.lost += r.lost * Math.max(0, days - r.dos);
          byStore.set(r.s, e);
        }
        const stores = Array.from(byStore, ([s, v2]) => ({ s, ...v2 })).sort((x, y) => y.lost - x.lost).slice(0, lim(a, 10));
        const top = rows.sort((x, y) => x.dos - y.dos || y.lost - x.lost).slice(0, 12);
        return {
          data: { horizonDays: days, storeSkusAtRisk: rows.length, storesAffected: byStore.size, worstStores: stores.map((x) => ({ store: sname(st, x.s), skusRunningOut: x.count, expectedLostSalesAED: r02(x.lost) })), mostUrgent: top.map((r) => ({ store: base.stores[r.s].id, sku: base.skus[r.k].id, name: base.skus[r.k].name, daysOfSupply: r13(r.dos) })) },
          visuals: [
            { kind: "hbar", title: `Expected lost sales if not replenished \xB7 next ${days} days`, xKey: "store", format: "money", series: [{ key: "lost", label: "Lost sales" }], rows: stores.map((x) => ({ store: sname(st, x.s), lost: r02(x.lost) })) },
            { kind: "table", title: "Most urgent store-SKUs", columns: [{ key: "store", label: "Store" }, { key: "sku", label: "SKU" }, { key: "name", label: "Product" }, { key: "dos", label: "Days of supply", format: "days" }], rows: top.map((r) => ({ store: base.stores[r.s].id, sku: base.skus[r.k].id, name: base.skus[r.k].name, dos: r13(r.dos) })) }
          ]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_overstock", description: "Overstocked store-SKUs (days of supply above threshold) with excess value. Optional store, country or category.", parameters: { type: "object", properties: { store: { type: "string" }, country: { type: "string" }, category: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? /* @__PURE__ */ new Set([sIdx]) : countryScope(st, a.country, scope);
        const cat = typeof a.category === "string" ? a.category.toLowerCase() : "";
        const rows = overstock(st, sc).filter((r) => !cat || base.skus[r.skuIdx].category.toLowerCase().includes(cat) || base.skus[r.skuIdx].department.toLowerCase().includes(cat));
        const top = rows.slice(0, lim(a, 10));
        return {
          data: { currency: "AED", overstockedStoreSkus: rows.length, excessValue: r02(rows.reduce((s, r) => s + r.excessValue, 0)), top: top.map((r) => ({ store: base.stores[r.storeIdx].id, sku: base.skus[r.skuIdx].id, name: base.skus[r.skuIdx].name, daysOfSupply: r02(r.daysOfSupply), excessUnits: r.excessUnits, excessValue: r02(r.excessValue) })) },
          visuals: [{ kind: "table", title: "Most overstocked", columns: [{ key: "store", label: "Store" }, { key: "name", label: "Product" }, { key: "dos", label: "Days of supply", format: "number" }, { key: "val", label: "Excess value", format: "money" }], rows: top.map((r) => ({ store: base.stores[r.storeIdx].id, name: base.skus[r.skuIdx].name, dos: r02(r.daysOfSupply), val: r02(r.excessValue) })) }]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_transfer_recommendations", description: "Products that should be transferred between stores (or from DC) to fix stockouts, with source, destination, quantity and sales protected.", parameters: { type: "object", properties: { store: { type: "string" }, country: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? /* @__PURE__ */ new Set([sIdx]) : countryScope(st, a.country, scope);
        const rows = transferRecommendations(st, sc).slice(0, lim(a, 12));
        const src = (r) => r.donor.type === "store" ? base.stores[r.donor.idx].id : base.dcs[r.donor.idx].name;
        return {
          data: rows.map((r) => ({ product: base.skus[r.skuIdx].name, sku: base.skus[r.skuIdx].id, from: src(r), to: sname(st, r.storeIdx), qty: r.donor.qty, destinationDaysLeft: r13(r.daysOfSupply), salesProtected7dAED: r02(r.lostSalesPerDay * 7) })),
          visuals: [{ kind: "table", title: "Recommended transfers", columns: [{ key: "p", label: "Product" }, { key: "f", label: "From" }, { key: "t", label: "To" }, { key: "q", label: "Qty", format: "number" }, { key: "v", label: "Sales protected (7d)", format: "money" }], rows: rows.map((r) => ({ p: base.skus[r.skuIdx].name, f: src(r), t: base.stores[r.storeIdx].id, q: r.donor.qty, v: r02(r.lostSalesPerDay * 7) })) }]
        };
      }
    },
    {
      type: "function",
      function: { name: "diagnose_store", description: "Explain a store's performance: sales vs target, availability vs regional peers, lost sales, out-of-stock categories, equipment faults, pricing exceptions, audit scores, supplier delays. Use for 'why is store X losing sales'.", parameters: { type: "object", properties: { store: { type: "string", description: "Store id (e.g. S118 or 118) or name" } }, required: ["store"] } },
      run: (a) => {
        const s = findStore(st, a.store);
        if (s === null) return { data: { error: "Store not found" }, visuals: [] };
        const d = storeDiagnosis(st, s);
        return {
          data: {
            store: sname(st, s),
            city: base.stores[s].city,
            sales30AED: r02(d.perf.sales30),
            targetAED: r02(d.perf.target),
            salesVsTarget: r13(d.perf.vsTarget * 100) + "%",
            availability: r13(d.perf.availability * 100) + "%",
            regionalPeerAvailability: r13(d.peerAvg.availability * 100) + "%",
            outOfStockSkus: d.perf.outOfStock,
            lostSales30AED: r02(d.perf.lostSales30),
            peerAvgLostSales30AED: r02(d.peerAvg.lostSales30),
            topOutOfStockCategories: d.oosByCategory.slice(0, 4).map((c) => ({ category: c.category, skus: c.count, lostPerMonthAED: r02(c.lost * 30) })),
            equipmentFaults: d.faults.map((f) => ({ equipment: `${f.equipment.type} ${f.equipment.id}`, issue: f.equipment.fault.kind, ticket: f.ticketId ?? "none" })),
            pricingExceptions: d.pricingExceptions.length,
            auditScore: r02(d.perf.auditScore),
            peerAuditScore: r02(d.peerAvg.auditScore),
            supplierDelaysAffecting: d.supplierDelays.length
          },
          visuals: [
            { kind: "bar", title: `${base.stores[s].id} vs ${base.stores[s].region} peers`, xKey: "metric", format: "percent", series: [{ key: "store", label: base.stores[s].id }, { key: "peers", label: "Peer average" }], rows: [{ metric: "Availability", store: r13(d.perf.availability * 100), peers: r13(d.peerAvg.availability * 100) }, { metric: "Sales vs target", store: r13(d.perf.vsTarget * 100), peers: r13(d.peerAvg.vsTarget * 100) }, { metric: "Audit score", store: r02(d.perf.auditScore), peers: r02(d.peerAvg.auditScore) }] },
            { kind: "table", title: "Out-of-stock categories", columns: [{ key: "c", label: "Category" }, { key: "n", label: "SKUs out", format: "number" }, { key: "l", label: "Lost sales / month", format: "money" }], rows: d.oosByCategory.slice(0, 6).map((c) => ({ c: c.category, n: c.count, l: r02(c.lost * 30) })) }
          ]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_supplier_performance", description: "Suppliers ranked by delivery risk: on-time rate, fill rate, average delay, late open POs, invoice issues; plus currently overdue POs and affected stores.", parameters: { type: "object", properties: { limit: { type: "number" } } } },
      run: (a) => {
        const sc = supplierScorecards(st).sort((x, y) => y.riskScore - x.riskScore).slice(0, lim(a, 8));
        const delays = supplierDelays(st, scope);
        return {
          data: { overduePOs: delays.map((d) => ({ po: d.poId, supplier: base.suppliers[d.supplierIdx].name, daysLate: d.daysLate, storesRunningLow: d.affectedStores.length })), suppliers: sc.map((s) => ({ supplier: base.suppliers[s.idx].name, onTime: r13(s.onTimeRate * 100) + "%", fillRate: r13(s.fillRate * 100) + "%", avgDelayDays: r13(s.avgDelayDays), lateOpenPOs: s.latePos, riskScore: s.riskScore })) },
          visuals: [
            { kind: "hbar", title: "Supplier on-time delivery (%)", xKey: "s", format: "percent", series: [{ key: "v", label: "On time" }], rows: sc.map((s) => ({ s: base.suppliers[s.idx].name, v: r13(s.onTimeRate * 100) })) },
            { kind: "table", title: "Supplier scorecard", columns: [{ key: "s", label: "Supplier" }, { key: "ot", label: "On time", format: "percent" }, { key: "f", label: "Fill rate", format: "percent" }, { key: "d", label: "Avg delay", format: "days" }, { key: "l", label: "Late POs", format: "number" }], rows: sc.map((s) => ({ s: base.suppliers[s.idx].name, ot: r13(s.onTimeRate * 100), f: r13(s.fillRate * 100), d: r13(s.avgDelayDays), l: s.latePos })) }
          ]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_expiring_products", description: "Perishable batches expiring within N days (default 15) that will not sell through in time, with value at risk and recommended markdown or transfer.", parameters: { type: "object", properties: { days: { type: "number" }, store: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const sc = sIdx !== null ? /* @__PURE__ */ new Set([sIdx]) : scope;
        const days = Math.min(30, Math.max(1, Number(a.days) || st.thresholds.expiryDays));
        const rows = expiryRisks({ ...st, thresholds: { ...st.thresholds, expiryDays: days } }, sc).filter((x) => x.markedDown === null);
        const top = rows.slice(0, lim(a, 12));
        return {
          data: { windowDays: days, batchesAtRisk: rows.length, valueAtRiskAED: r02(rows.reduce((s, r) => s + r.atRiskValue, 0)), top: top.map((r) => ({ store: base.stores[r.storeIdx].id, product: base.skus[r.skuIdx].name, lot: r.lot, daysLeft: r.daysLeft, qty: r.qty, expectedToSell: r.expectedToSell, valueAtRiskAED: r02(r.atRiskValue), recommendation: r.recommendation === "transfer" ? `transfer to ${base.stores[r.transferTo].id}` : `markdown ${st.thresholds.markdownPct}%` })) },
          visuals: [{ kind: "table", title: `Expiring within ${days} days`, columns: [{ key: "s", label: "Store" }, { key: "p", label: "Product" }, { key: "d", label: "Days left", format: "number" }, { key: "q", label: "Qty", format: "number" }, { key: "v", label: "At risk", format: "money" }, { key: "r", label: "Recommendation" }], rows: top.map((r) => ({ s: base.stores[r.storeIdx].id, p: base.skus[r.skuIdx].name, d: r.daysLeft, q: r.qty, v: r02(r.atRiskValue), r: r.recommendation === "transfer" ? `Transfer \u2192 ${base.stores[r.transferTo].id}` : `Markdown ${st.thresholds.markdownPct}%` })) }]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_inventory_accuracy", description: "Phantom inventory (system shows stock but no sales for days) and cycle counts in progress.", parameters: { type: "object", properties: { store: { type: "string" }, limit: { type: "number" } } } },
      run: (a) => {
        const sIdx = findStore(st, a.store);
        const rows = phantomInventory(st, sIdx !== null ? /* @__PURE__ */ new Set([sIdx]) : scope).slice(0, lim(a, 10));
        return {
          data: { phantomRecords: rows.length, countsInProgress: st.counts.filter((c) => c.status === "Counting").length, reconciled: st.counts.filter((c) => c.status === "Reconciled").map((c) => ({ count: c.id, variance: c.variance })), top: rows.map((r) => ({ store: base.stores[r.storeIdx].id, product: base.skus[r.skuIdx].name, systemQty: r.systemQty, daysNoSale: r.daysNoSale })) },
          visuals: [{ kind: "table", title: "Possible phantom inventory", columns: [{ key: "s", label: "Store" }, { key: "p", label: "Product" }, { key: "q", label: "System qty", format: "number" }, { key: "d", label: "Days without sale", format: "number" }], rows: rows.map((r) => ({ s: base.stores[r.storeIdx].id, p: base.skus[r.skuIdx].name, q: r.systemQty, d: r.daysNoSale })) }]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_equipment_issues", description: "Store equipment faults (refrigeration, HVAC, POS, generators) from IoT readings, ticket status and stock at risk.", parameters: { type: "object", properties: {} } },
      run: () => {
        const rows = equipmentIssues(st, scope);
        return {
          data: rows.map((e) => ({ store: base.stores[e.storeIdx].id, equipment: `${e.equipment.type} ${e.equipment.id}`, issue: e.equipment.fault.kind, reading: `${e.latest}${e.equipment.unit}`, ticket: e.ticketId ? `${e.ticketId} (${e.ticketStatus})` : "no ticket", stockAtRiskAED: r02(e.stockAtRiskValue) })),
          visuals: [{ kind: "table", title: "Equipment faults", columns: [{ key: "s", label: "Store" }, { key: "e", label: "Equipment" }, { key: "r", label: "Reading" }, { key: "t", label: "Ticket" }, { key: "v", label: "Stock at risk", format: "money" }], rows: rows.map((e) => ({ s: base.stores[e.storeIdx].id, e: `${e.equipment.type} ${e.equipment.id}`, r: `${e.latest}${e.equipment.unit}`, t: e.ticketId ?? "None", v: r02(e.stockAtRiskValue) })) }]
        };
      }
    },
    {
      type: "function",
      function: { name: "get_sku_analysis", description: "Analyse one product by SKU id, barcode or name: stock and sales across stores, stockouts, overstock, expiry and recommended actions.", parameters: { type: "object", properties: { sku: { type: "string" } }, required: ["sku"] } },
      run: (a) => {
        const q = String(a.sku ?? "").toLowerCase();
        const sku = base.skus.find((s) => s.id.toLowerCase() === q || s.gtin === q) ?? base.skus.find((s) => s.name.toLowerCase().includes(q));
        if (!sku) return { data: { error: "SKU not found" }, visuals: [] };
        const rows = base.stores.filter((s) => (!scope || scope.has(s.idx)) && base.carried[s.idx * NSKU + sku.idx]).map((s) => {
          const p = s.idx * NSKU + sku.idx;
          return { store: s.id, onHand: st.onHand(p), perDay: r13(base.velocity[p]), dos: r13(st.onHand(p) / Math.max(0.05, base.velocity[p])) };
        });
        const so = stockoutRisks(st, scope).filter((r) => r.skuIdx === sku.idx);
        return {
          data: { sku: sku.id, name: sku.name, brand: sku.brand, category: `${sku.department} > ${sku.category}`, costAED: sku.cost, priceAED: sku.price, marginPct: r13((sku.price - sku.cost) / sku.price * 100), storesRanged: rows.length, totalOnHand: rows.reduce((s, r) => s + r.onHand, 0), salesPerDay: r13(rows.reduce((s, r) => s + r.perDay, 0)), storesAtStockoutRisk: so.map((r) => base.stores[r.storeIdx].id), lowestCover: rows.sort((x, y) => x.dos - y.dos).slice(0, 5) },
          visuals: [{ kind: "table", title: `${sku.name} \xB7 lowest cover`, columns: [{ key: "store", label: "Store" }, { key: "onHand", label: "On hand", format: "number" }, { key: "perDay", label: "Sales/day", format: "number" }, { key: "dos", label: "Days of supply", format: "days" }], rows: rows.slice(0, 10) }]
        };
      }
    },
    {
      type: "function",
      function: {
        name: "get_sales_growth_levers",
        description: "Sales & margin analysis with the biggest levers to grow sales: net sales, LFL growth, gross margin, ATV, UPT, conversion, discount leakage, weakest stores, lost sales from stockouts, basket cross-sell pairs and upcoming trading events. Use for any question about increasing sales, revenue, growth, margin or store performance.",
        parameters: { type: "object", properties: { days: { type: "number", description: "Period in days (default 30)" } } }
      },
      run: (a) => {
        const days = Math.min(120, Math.max(7, Number(a.days) || 30));
        const t = salesTotals(st, scope, days);
        const prev = salesPrev(st, scope, days);
        const stores = salesByStore(st, scope, days);
        const weakest = [...stores].sort((x, y) => x.lfl - y.lfl).slice(0, 5);
        const k = retailKpis(st, scope);
        const lost30 = k.perf.reduce((s, p) => s + p.lostSales30, 0);
        const byCity = /* @__PURE__ */ new Map();
        for (const s of stores) {
          const e = byCity.get(s.store.city) ?? { net: 0, gross: 0, disc: 0, cogs: 0 };
          e.net += s.net;
          e.gross += s.gross;
          e.disc += s.discounts;
          e.cogs += s.cogs;
          byCity.set(s.store.city, e);
        }
        const leakage = [...byCity.entries()].map(([city, e]) => ({ city, discountRate: r13(e.disc / Math.max(1, e.gross) * 100), gmPct: r13((e.net - e.cogs) / Math.max(1, e.net) * 100), net: r02(e.net) })).sort((x, y) => y.discountRate - x.discountRate).slice(0, 4);
        const events = upcomingEvents(st, scope, 45).map((e) => ({ name: e.name, start: e.start, end: e.end, upliftByDepartment: e.uplift }));
        const cross = base.basket.filter((_, i) => i % 2 === 0).slice(0, 4).map((b) => ({ ifBuys: b.a, alsoBuys: b.b, confidencePct: r02(b.confidence * 100), lift: b.lift }));
        return {
          data: {
            periodDays: days,
            netSalesAED: r02(t.net),
            vsPriorPeriodPct: r13((t.net / Math.max(1, prev.net) - 1) * 100),
            lflGrowthPct: r13(t.lfl * 100),
            grossMarginPct: r13(t.gmPct * 100),
            grossMarginChangePp: r13((t.gmPct - prev.gmPct) * 100),
            atvAED: r13(t.atv),
            unitsPerTransaction: r13(t.upt),
            conversionPct: r13(t.conversion * 100),
            discountRatePct: r13(t.discountRate * 100),
            lostSalesFromStockouts30dAED: r02(lost30),
            outOfStockNow: k.outOfStock,
            weakestStoresByLfl: weakest.map((s) => ({ store: `${s.store.id} ${s.store.name}`, city: s.store.city, lflPct: r13(s.lfl * 100), conversionPct: r13(s.conversion * 100), netAED: r02(s.net) })),
            highestDiscountCities: leakage,
            crossSellPairs: cross,
            upcomingEvents: events
          },
          visuals: [
            { kind: "hbar", title: "Weakest stores \xB7 LFL growth %", xKey: "name", series: [{ key: "lfl", label: "LFL %" }], format: "number", rows: weakest.map((s) => ({ name: `${s.store.id} ${s.store.name}`, lfl: r13(s.lfl * 100) })) },
            { kind: "table", title: "Growth levers", columns: [{ key: "lever", label: "Lever" }, { key: "evidence", label: "Evidence" }, { key: "value", label: "Size (AED)", format: "money" }], rows: [
              { lever: "Fix stockouts", evidence: `${k.outOfStock} store-SKUs out of stock now`, value: r02(lost30) },
              { lever: "Stop discount leakage", evidence: `${leakage[0]?.city ?? "\u2014"} discount rate ${leakage[0]?.discountRate ?? 0}% \xB7 GM ${leakage[0]?.gmPct ?? 0}%`, value: r02(t.discounts - prev.discounts > 0 ? t.discounts - prev.discounts : 0) },
              { lever: "Lift basket size (cross-sell)", evidence: cross[0] ? `${cross[0].ifBuys} \u2192 ${cross[0].alsoBuys} (lift ${cross[0].lift}\xD7)` : "\u2014", value: r02(t.net * 0.02) },
              { lever: "Turn around weakest stores", evidence: weakest[0] ? `${weakest[0].store.id} LFL ${r13(weakest[0].lfl * 100)}%` : "\u2014", value: r02(weakest.reduce((s, x) => s + Math.max(0, x.lyNet - x.net), 0)) }
            ] }
          ]
        };
      }
    }
  ];
}
var FOLLOW = {
  get_retail_overview: ["Which stores will run out of stock this week?", "Which suppliers are delivering late?"],
  get_stockout_forecast: ["Which products should be transferred between stores?", "Why is Store 118 losing sales?"],
  get_overstock: ["Which products should be transferred between stores?", "Which products will expire within 15 days?"],
  get_transfer_recommendations: ["Which SKUs are overstocked?", "Which stores will run out of stock this week?"],
  diagnose_store: ["Which products should be transferred to this store?", "Which equipment faults are open?"],
  get_supplier_performance: ["Which stores are affected by late deliveries?", "Which stores will run out of stock this week?"],
  get_expiring_products: ["Which SKUs are overstocked?", "What is the total inventory loss risk?"],
  get_inventory_accuracy: ["Which stores will run out of stock this week?", "Why is Store 118 losing sales?"],
  get_equipment_issues: ["Why is Store 118 losing sales?", "Which products will expire within 15 days?"],
  get_sku_analysis: ["Which products should be transferred between stores?", "Which SKUs are overstocked?"],
  get_sales_growth_levers: ["Why is gross margin declining in Dubai stores?", "Why is Store 118 losing sales?", "Which stores will run out of stock this week?"]
};
var STEP = {
  get_retail_overview: () => "Read chain KPIs across stores, stock, suppliers and expiry",
  get_stockout_forecast: () => "Forecast days of supply for every store-SKU",
  get_overstock: () => "Scanned store-SKUs above the overstock threshold",
  get_transfer_recommendations: () => "Matched stockouts with donor stores and DCs",
  diagnose_store: (a) => `Diagnosed store ${String(a.store ?? "").toUpperCase()} against regional peers`,
  get_supplier_performance: () => "Scored suppliers on on-time delivery and fill rate",
  get_expiring_products: (a) => `Checked perishable batches expiring within ${a.days ?? 15} days`,
  get_inventory_accuracy: () => "Looked for phantom inventory and open cycle counts",
  get_equipment_issues: () => "Read equipment sensors, faults and open tickets",
  get_sku_analysis: (a) => `Analysed ${String(a.sku ?? "the SKU")} across all stores`,
  get_sales_growth_levers: (a) => `Analysed ${a.days ?? 30}-day POS sales, margin, baskets and lost sales across stores`
};
var ACTION = {
  get_retail_overview: () => ({ label: "Open master dashboard", to: "/app/retail/master" }),
  get_stockout_forecast: () => ({ label: "Fix stockouts", to: "/app/retail/replenishment?tab=stockouts" }),
  get_overstock: () => ({ label: "Rebalance overstock", to: "/app/retail/replenishment?tab=overstock" }),
  get_transfer_recommendations: () => ({ label: "Approve transfers", to: "/app/retail/transfers" }),
  diagnose_store: (a) => ({ label: `Open store ${String(a.store ?? "").toUpperCase().replace(/^(\d)/, "S$1")}`, to: `/app/retail/stores/${String(a.store ?? "").toUpperCase().replace(/^(\d)/, "S$1")}` }),
  get_supplier_performance: () => ({ label: "Review late deliveries", to: "/app/retail/suppliers?tab=delays" }),
  get_expiring_products: () => ({ label: "Apply markdowns & transfers", to: "/app/retail/replenishment?tab=expiry" }),
  get_inventory_accuracy: () => ({ label: "Start cycle counts", to: "/app/retail/replenishment?tab=phantom" }),
  get_equipment_issues: () => ({ label: "Create maintenance tickets", to: "/app/retail/maintenance" }),
  get_sku_analysis: (a) => ({ label: "Open SKU details", to: `/app/retail/skus?sku=${encodeURIComponent(String(a.sku ?? ""))}` }),
  get_sales_growth_levers: () => ({ label: "Open sales & margin dashboard", to: "/app/retail/insights/sales" })
};
function chartFor(t) {
  if (t.kind !== "table" || t.rows.length < 2) return null;
  const valueCol = t.columns.find((c) => c.format === "money") ?? t.columns.find((c) => c.format === "number" || c.format === "days");
  const catCol = t.columns.find((c) => !c.format || c.format === "text");
  if (!valueCol || !catCol) return null;
  const sums = /* @__PURE__ */ new Map();
  for (const r of t.rows) {
    const k = String(r[catCol.key] ?? "\u2014");
    sums.set(k, (sums.get(k) ?? 0) + (Number(r[valueCol.key]) || 0));
  }
  const rows = [...sums.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, value]) => ({ name, value: Math.round(value) }));
  if (rows.length < 2) return null;
  return { kind: "hbar", title: `${valueCol.label} by ${catCol.label.toLowerCase()}`, xKey: "name", series: [{ key: "value", label: valueCol.label }], format: valueCol.format === "money" ? "money" : "number", rows };
}
async function runRetailCopilot(question, history, events, scopeStores, token) {
  const base = await getRetailData2(token);
  const st = buildState(base, Array.isArray(events) ? events.slice(-2e3) : []);
  const scope = scopeStores ? new Set(scopeStores) : null;
  const T = tools(st, scope);
  const defs = T.map(({ type, function: f }) => ({ type, function: f }));
  const system = `You are SCIO, the retail operations copilot inside SCIO Retail OS for a retail chain operating in the UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain (${base.stores.length} stores in UAE, Saudi Arabia, Qatar, Kuwait, Oman and Bahrain; ${base.skus.length} SKUs). Today is ${base.anchorDate}. Reporting currency AED.
${scope ? `The user can only see these stores: ${[...scope].map((s) => base.stores[s].id).join(", ")}.` : "The user sees all stores."}
Store ids look like S101-S150 ("Store 118" = S118).
Rules:
- ALWAYS call tools before answering. Never invent numbers; use only tool figures.
- Never refuse or say you lack data. For growth, revenue, sales or margin questions call get_sales_growth_levers (plus other tools as useful) and give a prioritised action plan: the biggest levers first, each with its AED size and who should act.
- Format: one-sentence direct answer, then 2-5 short bullets with key figures (**bold** numbers), then a line starting "Recommendation:" with concrete actions (who should do what).
- Mention that tables/charts below show the evidence. Never write markdown tables (the evidence tables are rendered separately). Under 180 words.
- If asked where the data comes from, say it is sample data for this workspace; never present it as a real customer's data.`;
  const messages = [{ role: "system", content: system }, ...history.slice(-8).map((t) => ({ role: t.role, content: t.content.slice(0, 2e3) })), { role: "user", content: question.slice(0, 1e3) }];
  const visuals = [];
  const used = [];
  const steps = [];
  const actions = [];
  const finish = (answer) => ({
    answer,
    visuals,
    toolsUsed: used,
    followUps: Array.from(new Set(used.flatMap((t) => FOLLOW[t] ?? []))).slice(0, 3),
    steps: [...steps, ...used.length ? [`Ranked findings by business impact and drafted actions`] : []],
    actions: actions.filter((a, i) => actions.findIndex((x) => x.to === a.to) === i).slice(0, 3)
  });
  for (let step = 0; step < 4; step++) {
    const { message: message2 } = await sarvamChat({ messages, tools: defs, maxTokens: 900 });
    const calls = message2.tool_calls ?? [];
    if (!calls.length) {
      return finish((message2.content ?? "").trim() || "I couldn't answer that. Try rephrasing.");
    }
    messages.push({ role: "assistant", content: message2.content ?? null, tool_calls: calls });
    for (const c of calls) {
      const tool = T.find((t) => t.function.name === c.function.name);
      let args = {};
      try {
        args = JSON.parse(c.function.arguments || "{}");
      } catch {
      }
      let content;
      if (!tool) content = JSON.stringify({ error: "unknown tool" });
      else {
        const r = tool.run(args);
        if (!used.includes(tool.function.name)) {
          used.push(tool.function.name);
          const hasChart = r.visuals.some((v2) => v2.kind !== "table");
          const charts = hasChart ? [] : r.visuals.map(chartFor).filter((v2) => v2 !== null);
          visuals.push(...charts, ...r.visuals);
          const table = r.visuals.find((v2) => v2.kind === "table");
          steps.push(`${(STEP[tool.function.name] ?? (() => tool.function.name))(args)}${table ? ` \xB7 ${table.rows.length} results ranked` : ""}`);
          const act = ACTION[tool.function.name]?.(args);
          if (act) actions.push(act);
        }
        content = JSON.stringify(r.data);
      }
      messages.push({ role: "tool", tool_call_id: c.id, content });
    }
  }
  const { message } = await sarvamChat({ messages, maxTokens: 900 });
  return finish((message.content ?? "").trim());
}

// src/server/demo/vision.ts
var DEFECT_TYPES = ["corrosion", "crack", "leak", "deformation", "missing_component", "surface_damage", "wear", "other"];
var SCHEMA_TEXT = `Return ONLY a JSON object with exactly this shape:
{
  "equipment": string,                       // what the equipment/structure appears to be
  "image_quality": "good" | "fair" | "poor",
  "defects": [                               // only defects that are VISIBLE in the image; [] if none
    {
      "type": ${DEFECT_TYPES.map((t) => `"${t}"`).join(" | ")},
      "label": string,                       // short, e.g. "Surface rust on flange bolts"
      "box_2d": [ymin, xmin, ymax, xmax],    // integers 0-1000, normalised to image height/width
      "confidence": number,                  // 0-1, how certain the defect is visible
      "evidence": string                     // the visual cue you see (colour, texture, shape)
    }
  ],
  "interpretation": {
    "severity": "none" | "low" | "moderate" | "high" | "critical",
    "summary": string,                       // 1-2 sentences
    "likely_cause": string,
    "recommended_action": string,
    "follow_up": string                      // e.g. re-inspect in 30 days, ultrasonic thickness test
  }COMPARISON
}`;
var COMPARISON_TEXT = `,
  "comparison": {                            // compare CURRENT image (second) against PREVIOUS image (first)
    "trend": "worse" | "similar" | "better" | "unclear",
    "summary": string                        // e.g. "The corroded area has grown and now covers the weld seam."
  }`;
var SYSTEM = `You are an industrial visual inspection assistant. You examine photos of equipment, machinery, pipelines and infrastructure.
Be precise and conservative: only report defects you can actually see. Never invent defects. If the image is unclear or not industrial equipment, say so with an empty defects list.
Bounding boxes must tightly enclose each visible defect region.`;
function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}
function normaliseBox(b) {
  if (!Array.isArray(b) || b.length !== 4) return null;
  const [ymin, xmin, ymax, xmax] = b.map(Number);
  if ([ymin, xmin, ymax, xmax].some((v2) => !Number.isFinite(v2))) return null;
  const scale = Math.max(ymin, xmin, ymax, xmax) <= 1.0001 ? 1 : 1e3;
  const x = clamp01(Math.min(xmin, xmax) / scale);
  const y = clamp01(Math.min(ymin, ymax) / scale);
  const w = clamp01(Math.abs(xmax - xmin) / scale);
  const h2 = clamp01(Math.abs(ymax - ymin) / scale);
  if (w < 0.01 || h2 < 0.01) return null;
  return { x, y, w, h: h2 };
}
var isDataUrl = (s) => typeof s === "string" && /^data:image\/(png|jpe?g|webp);base64,/.test(s);
async function runVision(image, previousImage) {
  if (!isDataUrl(image)) throw new Error("Image must be a PNG, JPEG or WebP data URL");
  if (image.length > 4e6) throw new Error("Image is too large");
  const compare = isDataUrl(previousImage);
  const content = [];
  if (compare) {
    content.push({ type: "text", text: "PREVIOUS inspection image:" });
    content.push({ type: "image_url", image_url: { url: previousImage, detail: "high" } });
    content.push({ type: "text", text: "CURRENT inspection image (analyse defects in THIS image):" });
  }
  content.push({ type: "image_url", image_url: { url: image, detail: "high" } });
  content.push({ type: "text", text: SCHEMA_TEXT.replace("COMPARISON", compare ? COMPARISON_TEXT : "") });
  const messages = [
    { role: "system", content: SYSTEM },
    { role: "user", content }
  ];
  const { message } = await sarvamChat({ messages, json: true, maxTokens: 1500, temperature: 0.1, timeoutMs: 58e3 });
  const raw = parseJsonLoose(message.content);
  if (!raw) throw new Error("The vision model returned an unreadable response. Please try again.");
  const defects = (Array.isArray(raw.defects) ? raw.defects : []).slice(0, 12).map((d) => ({
    type: DEFECT_TYPES.includes(d?.type) ? d.type : "other",
    label: String(d?.label ?? "Defect").slice(0, 120),
    box: normaliseBox(d?.box_2d ?? d?.box),
    confidence: clamp01(Number(d?.confidence) || 0.5),
    evidence: String(d?.evidence ?? "").slice(0, 300)
  }));
  const it = raw.interpretation ?? {};
  const sev = ["none", "low", "moderate", "high", "critical"].includes(it.severity) ? it.severity : defects.length ? "moderate" : "none";
  const result = {
    equipment: String(raw.equipment ?? "Equipment").slice(0, 160),
    imageQuality: ["good", "fair", "poor"].includes(raw.image_quality) ? raw.image_quality : "fair",
    defects,
    interpretation: {
      severity: sev,
      summary: String(it.summary ?? "").slice(0, 600),
      likelyCause: String(it.likely_cause ?? "").slice(0, 400),
      recommendedAction: String(it.recommended_action ?? "").slice(0, 400),
      followUp: String(it.follow_up ?? "").slice(0, 300)
    }
  };
  if (compare && raw.comparison) {
    const c = raw.comparison;
    result.comparison = {
      trend: ["worse", "similar", "better", "unclear"].includes(c.trend) ? c.trend : "unclear",
      summary: String(c.summary ?? "").slice(0, 500)
    };
  }
  return result;
}

// src/demo/retail/documents.ts
function invoiceNumberFor(base, po) {
  const sup = base.suppliers[po.supplierIdx];
  const prefix = sup.name.replace(/[^A-Za-z ]/g, "").split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 3).toUpperCase();
  return `${prefix}-INV-${po.id.slice(3)}`;
}

// src/server/demo/retailDocuments.ts
var money = (n) => "AED " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
function matchRetail(doc, base) {
  const checks = [];
  const findings = [];
  let amountAtRisk = 0;
  const lineSum = doc.lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const mathOk = doc.lineItems.every((l) => !l.amount || Math.abs(l.quantity * l.unitPrice - l.amount) < 0.05 * Math.max(1, l.amount)) && (doc.total === null || doc.subtotal === null || doc.vat === null || Math.abs(doc.subtotal + doc.vat - doc.total) < 1);
  checks.push({ id: "math", label: "Arithmetic & VAT", status: mathOk ? "pass" : "fail", detail: mathOk ? `Lines and VAT add up to ${money(doc.total ?? lineSum)}.` : "Line amounts or totals do not add up." });
  const po = doc.poNumber ? base.pos.find((p) => p.id.toLowerCase() === doc.poNumber.toLowerCase()) : void 0;
  const dupPo = doc.invoiceNumber ? base.pos.find((p) => p.received && p.received < base.anchorDate && invoiceNumberFor(base, p).toLowerCase() === doc.invoiceNumber.toLowerCase()) : void 0;
  const paidDate = dupPo?.received ?? null;
  const isDup = !!dupPo && !!paidDate && new Date(base.anchorDate).getTime() - new Date(paidDate).getTime() > 10 * 864e5;
  if (isDup) {
    const total = doc.total ?? lineSum * 1.05;
    checks.push({ id: "dup", label: "Duplicate check", status: "fail", detail: `Invoice ${doc.invoiceNumber} was already posted for ${dupPo.id} after receipt on ${paidDate} and has been paid.` });
    findings.push(`This invoice number was already processed and paid for ${dupPo.id}; paying it again would be a duplicate payment of ${money(total)}.`);
    amountAtRisk += total;
  } else checks.push({ id: "dup", label: "Duplicate check", status: "pass", detail: "No previously paid invoice with this number." });
  let matchedPo = null;
  if (!po) {
    checks.push({ id: "po", label: "Purchase order", status: "fail", detail: doc.poNumber ? `PO ${doc.poNumber} was not found.` : "No PO number on the document." });
    findings.push("The invoice does not match an existing purchase order.");
  } else {
    const sup = base.suppliers[po.supplierIdx];
    const first = po.lines[0];
    matchedPo = { id: po.id, supplier: sup.name, item: `${po.lines.length} lines`, quantity: first.ordered, unitPrice: first.unitCost, orderDate: po.created, deliveredDate: po.received };
    checks.push({ id: "po", label: "Purchase order", status: "pass", detail: `Matched ${po.id} (${po.lines.length} lines) raised on ${po.created}.` });
    const supOk = !!doc.supplierName && doc.supplierName.toLowerCase().includes(sup.name.toLowerCase().split(" ")[0]);
    checks.push({ id: "supplier", label: "Supplier", status: supOk ? "pass" : "fail", detail: supOk ? `${sup.name} matches the PO.` : `Invoice supplier differs from PO supplier ${sup.name}.` });
    let qtyIssues = 0;
    let priceIssues = 0;
    let grnIssues = 0;
    for (const l of doc.lineItems) {
      const poLine = po.lines.find((x) => base.skus[x.skuIdx].id.toLowerCase() === (l.itemCode ?? "").toLowerCase()) ?? po.lines.find((x) => base.skus[x.skuIdx].name.toLowerCase().startsWith(l.description.toLowerCase().replace("\u2026", "").slice(0, 18)));
      if (!poLine) continue;
      const sku = base.skus[poLine.skuIdx];
      if (l.quantity > poLine.ordered) {
        qtyIssues++;
        findings.push(`${sku.id}: invoice quantity is ${l.quantity}, while the purchase order specifies ${poLine.ordered}.`);
      }
      if (l.quantity > poLine.received) {
        grnIssues++;
        findings.push(`${sku.id}: only ${poLine.received} received, ${l.quantity - poLine.received} invoiced units have no goods receipt.`);
      }
      const diff = (l.unitPrice - poLine.unitCost) / poLine.unitCost;
      if (diff > 0.01) {
        priceIssues++;
        findings.push(`${sku.id}: unit price is ${(diff * 100).toFixed(0)}% higher than the agreed price.`);
      }
      if (!isDup) amountAtRisk += Math.max(0, l.quantity * l.unitPrice - Math.min(l.quantity, poLine.received) * poLine.unitCost) * 1.05;
    }
    checks.push({ id: "qty", label: "Quantity vs PO", status: qtyIssues ? "fail" : "pass", detail: qtyIssues ? `${qtyIssues} line(s) invoiced above the ordered quantity.` : "All lines within ordered quantity." });
    checks.push({ id: "grn", label: "Goods received", status: grnIssues ? "fail" : "pass", detail: grnIssues ? `${grnIssues} line(s) invoiced above the goods receipt.` : `Goods receipt posted ${po.received ?? "\u2013"}.` });
    checks.push({ id: "price", label: "Unit price vs PO", status: priceIssues ? "fail" : "pass", detail: priceIssues ? `${priceIssues} line(s) priced above the PO.` : "All prices match the PO." });
  }
  const fails = checks.filter((c) => c.status === "fail").length;
  const decision = isDup ? "reject" : fails ? "needs-approval" : "auto-approve";
  const summary = findings.length ? findings.join(" ") + (amountAtRisk > 0 ? ` Amount at risk: ${money(amountAtRisk)}.` : "") : `The invoice matches ${po?.id ?? "the purchase order"} on supplier, quantities, prices and goods receipt. It can be approved for payment.`;
  void matchedPo;
  return { matchedPo: null, checks, decision, summary, amountAtRisk: Math.round(amountAtRisk * 100) / 100 };
}

// src/server/demo/documents.ts
var num = (v2) => {
  if (typeof v2 === "number" && Number.isFinite(v2)) return v2;
  if (typeof v2 === "string") {
    const n = Number(v2.replace(/[^0-9.-]/g, ""));
    return Number.isFinite(n) && v2.trim() !== "" ? n : null;
  }
  return null;
};
var str = (v2) => typeof v2 === "string" && v2.trim() ? v2.trim() : null;
var money2 = (n) => "AED " + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
var PROMPT = `Extract the fields from this supplier document. The text was produced by OCR, so fix obvious OCR spacing errors but never invent values.
Return ONLY JSON:
{
 "document_type": "invoice" | "purchase_order" | "delivery_note" | "contract" | "other",
 "supplier_name": string|null, "supplier_trn": string|null,
 "invoice_number": string|null, "invoice_date": "YYYY-MM-DD"|null,
 "po_number": string|null, "payment_terms": string|null, "due_date": "YYYY-MM-DD"|null,
 "currency": string|null,
 "line_items": [{"item_code": string|null, "description": string, "quantity": number, "unit_price": number, "amount": number}],
 "subtotal": number|null, "vat": number|null, "total": number|null
}
Use plain numbers without thousands separators.`;
async function processDocument(ocrText, sector = "industrial", token) {
  const text = String(ocrText || "").slice(0, 12e3);
  if (text.trim().length < 20) throw new Error("Document text is empty. The OCR could not read the document.");
  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: "You are a precise accounts-payable document extraction engine." },
      { role: "user", content: `${PROMPT}

OCR TEXT:
"""
${text}
"""` }
    ],
    json: true,
    maxTokens: 1200,
    temperature: 0
  });
  const raw = parseJsonLoose(message.content);
  if (!raw) throw new Error("Could not extract fields from this document. Please try again.");
  const extracted = {
    documentType: str(raw.document_type) ?? "other",
    supplierName: str(raw.supplier_name),
    supplierTrn: str(raw.supplier_trn),
    invoiceNumber: str(raw.invoice_number),
    invoiceDate: str(raw.invoice_date),
    poNumber: str(raw.po_number)?.replace(/\s+/g, "") ?? null,
    paymentTerms: str(raw.payment_terms),
    dueDate: str(raw.due_date),
    currency: str(raw.currency),
    lineItems: (Array.isArray(raw.line_items) ? raw.line_items : []).slice(0, 30).map((l) => ({
      itemCode: str(l?.item_code)?.replace(/\s+/g, "") ?? null,
      description: String(l?.description ?? "").slice(0, 200),
      quantity: num(l?.quantity) ?? 0,
      unitPrice: num(l?.unit_price) ?? 0,
      amount: num(l?.amount) ?? 0
    })),
    subtotal: num(raw.subtotal),
    vat: num(raw.vat),
    total: num(raw.total)
  };
  return { extracted, ...sector === "retail" ? matchRetail(extracted, await getRetailData2(token)) : match(extracted, await getIndustrialData2(token)) };
}
function match(doc, ds) {
  const checks = [];
  const findings = [];
  let amountAtRisk = 0;
  const lineSum = doc.lineItems.reduce((s, l) => s + l.quantity * l.unitPrice, 0);
  const lineAmountsOk = doc.lineItems.every((l) => Math.abs(l.quantity * l.unitPrice - l.amount) < 0.05 * Math.max(1, l.amount) || l.amount === 0);
  const totalOk = doc.total !== null && doc.subtotal !== null && doc.vat !== null ? Math.abs(doc.subtotal + doc.vat - doc.total) < 1 : true;
  checks.push({
    id: "math",
    label: "Arithmetic & VAT",
    status: lineAmountsOk && totalOk ? "pass" : "fail",
    detail: lineAmountsOk && totalOk ? `Line totals and VAT add up to ${doc.total !== null ? money2(doc.total) : money2(lineSum)}.` : "Line amounts or totals do not add up."
  });
  if (doc.subtotal !== null && doc.vat !== null && doc.subtotal > 0) {
    const rate = doc.vat / doc.subtotal;
    if (Math.abs(rate - 0.05) > 3e-3) {
      checks.push({ id: "vat", label: "VAT rate", status: "warn", detail: `VAT charged at ${(rate * 100).toFixed(1)}% instead of the standard 5%.` });
      findings.push(`VAT is charged at ${(rate * 100).toFixed(1)}% instead of 5%.`);
    }
  }
  const sup = ds.suppliers.find((s) => doc.supplierName && s.name.toLowerCase() === doc.supplierName.toLowerCase()) ?? ds.suppliers.find((s) => doc.supplierName && doc.supplierName.toLowerCase().includes(s.name.toLowerCase().split(" ")[0]));
  const dup = ds.invoices.find((i) => doc.invoiceNumber && i.number.toLowerCase() === doc.invoiceNumber.toLowerCase());
  const dupByAmount = !dup && sup && doc.total !== null ? ds.invoices.find((i) => i.supplierId === sup.id && Math.abs(i.total - doc.total) < 0.5) : void 0;
  if (dup) {
    checks.push({ id: "dup", label: "Duplicate check", status: "fail", detail: `Invoice ${dup.number} was already received on ${dup.date} (${money2(dup.total)}, status: ${dup.status}).` });
    findings.push(`This invoice number was already processed on ${dup.date} and is marked ${dup.status.toLowerCase()}, so paying it again would be a duplicate payment of ${money2(dup.total)}.`);
    amountAtRisk += dup.total;
  } else if (dupByAmount) {
    checks.push({ id: "dup", label: "Duplicate check", status: "warn", detail: `Same supplier and amount as invoice ${dupByAmount.number} (${dupByAmount.date}).` });
    findings.push(`The amount matches invoice ${dupByAmount.number} from the same supplier; check it is not a resubmission.`);
  } else {
    checks.push({ id: "dup", label: "Duplicate check", status: "pass", detail: "No previous invoice with this number or amount." });
  }
  const po = doc.poNumber ? ds.purchaseOrders.find((p) => p.id.toLowerCase() === doc.poNumber.toLowerCase()) : void 0;
  let matchedPo = null;
  if (!po) {
    checks.push({ id: "po", label: "Purchase order", status: "fail", detail: doc.poNumber ? `PO ${doc.poNumber} was not found.` : "No PO number on the document." });
    findings.push(doc.poNumber ? `PO ${doc.poNumber} does not exist in the system.` : "The document does not reference a purchase order.");
  } else {
    const poSup = ds.suppliers.find((s) => s.id === po.supplierId);
    const poItem = ds.items.find((i) => i.id === po.itemId);
    matchedPo = { id: po.id, supplier: poSup.name, item: poItem.name, quantity: po.quantity, unitPrice: po.unitPrice, orderDate: po.orderDate, deliveredDate: po.deliveredDate };
    checks.push({ id: "po", label: "Purchase order", status: "pass", detail: `Matched ${po.id} raised on ${po.orderDate}.` });
    const supOk = sup?.id === po.supplierId;
    checks.push({
      id: "supplier",
      label: "Supplier",
      status: supOk ? "pass" : "fail",
      detail: supOk ? `${poSup.name} matches the PO.` : `Invoice supplier "${doc.supplierName ?? "unknown"}" differs from PO supplier ${poSup.name}.`
    });
    if (!supOk) findings.push(`The supplier on the invoice does not match the PO supplier (${poSup.name}).`);
    const line = doc.lineItems.find((l) => l.itemCode && l.itemCode.toLowerCase() === po.itemId.toLowerCase()) ?? doc.lineItems[0];
    if (line) {
      const qtyDiff = line.quantity - po.quantity;
      checks.push({
        id: "qty",
        label: "Quantity vs PO",
        status: qtyDiff === 0 ? "pass" : "fail",
        detail: qtyDiff === 0 ? `${line.quantity} units, as ordered.` : `Invoiced ${line.quantity} units; PO specifies ${po.quantity} (${qtyDiff > 0 ? "+" : ""}${qtyDiff}).`
      });
      if (qtyDiff !== 0) findings.push(`The invoice quantity is ${line.quantity} units, while the purchase order specifies ${po.quantity} units.`);
      const received = po.deliveredDate ? po.quantity : 0;
      checks.push({
        id: "grn",
        label: "Goods received",
        status: !po.deliveredDate ? "fail" : line.quantity <= received ? "pass" : "fail",
        detail: !po.deliveredDate ? "No goods receipt recorded yet." : line.quantity <= received ? `${received} units received on ${po.deliveredDate}.` : `Only ${received} units were received on ${po.deliveredDate}.`
      });
      if (po.deliveredDate && line.quantity > received) findings.push(`Only ${received} units were received, so ${line.quantity - received} invoiced units have no goods receipt.`);
      if (!po.deliveredDate) findings.push("No goods receipt has been recorded for this order yet.");
      const priceDiff = (line.unitPrice - po.unitPrice) / po.unitPrice;
      const priceOk = Math.abs(priceDiff) <= 0.01;
      checks.push({
        id: "price",
        label: "Unit price vs PO",
        status: priceOk ? "pass" : Math.abs(priceDiff) <= 0.03 ? "warn" : "fail",
        detail: priceOk ? `${money2(line.unitPrice)} matches the agreed price.` : `${money2(line.unitPrice)} vs agreed ${money2(po.unitPrice)} (${priceDiff > 0 ? "+" : ""}${(priceDiff * 100).toFixed(1)}%).`
      });
      if (!priceOk) findings.push(`The unit price is ${Math.abs(priceDiff * 100).toFixed(0)}% ${priceDiff > 0 ? "higher" : "lower"} than the agreed price.`);
      if (!dup) {
        const allowed = Math.min(line.quantity, po.deliveredDate ? po.quantity : 0) * po.unitPrice;
        amountAtRisk += Math.max(0, line.quantity * line.unitPrice - allowed) * 1.05;
      }
    }
  }
  const fails = checks.filter((c) => c.status === "fail").length;
  const warns = checks.filter((c) => c.status === "warn").length;
  const decision = dup ? "reject" : fails ? "needs-approval" : warns ? "needs-approval" : "auto-approve";
  const summary = findings.length ? findings.join(" ") + (amountAtRisk > 0 ? ` Amount at risk: ${money2(amountAtRisk)}.` : "") : `The invoice matches ${po?.id ?? "the purchase order"} on supplier, quantity, price and goods receipt. It can be approved for payment.`;
  return { matchedPo, checks, decision, summary, amountAtRisk: Math.round(amountAtRisk * 100) / 100 };
}

// src/server/demo/explain.ts
var SYSTEM2 = `You are SCIO, an industrial operations assistant. Explain the computed facts you are given to a maintenance or operations manager.
Write 3-4 short sentences: what is happening, why it matters, and the recommended action with priority. Use **bold** for key numbers.
Use only the facts provided. Do not invent numbers. No headings, no bullet points.`;
async function explainAsset(assetId, token) {
  const ds = await getIndustrialData2(token);
  const asset = ds.assets.find((a) => a.id === assetId);
  if (!asset) throw new Error("Unknown asset");
  const h2 = assetHealth(ds, asset);
  const parts = ds.items.filter((i) => asset.partIds.includes(i.id)).map((p) => ({ part: p.name, stock: p.stock, minimum: p.minStock }));
  const facts = {
    asset: asset.name,
    type: asset.type,
    site: asset.site,
    criticality: asset.criticality,
    runningHours: asset.runningHours,
    healthScore: h2.healthScore,
    status: h2.status,
    vibration: {
      last7DayAvgMmS: +h2.vibration.recentMean.toFixed(2),
      baselineMmS: +h2.vibration.baselineMean.toFixed(2),
      trendMmSPerDay: +h2.vibration.slopePerDay.toFixed(3),
      alarmLimitMmS: VIBRATION_ZONES.alarm,
      projectedDaysToAlarm: h2.daysToAlarm
    },
    pressure: h2.pressure ? { last7DayAvgBar: +h2.pressure.recentMean.toFixed(2), baselineBar: +h2.pressure.baselineMean.toFixed(2) } : null,
    maintenanceDaysOverdue: h2.daysOverdue,
    lastService: asset.lastServiceDate,
    failedInspections12m: h2.inspectionFails,
    spareParts: parts,
    riskDrivers: h2.drivers
  };
  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: SYSTEM2 },
      { role: "user", content: `Facts (JSON):
${JSON.stringify(facts)}` }
    ],
    maxTokens: 400,
    temperature: 0.2
  });
  return { explanation: (message.content ?? "").trim() };
}
async function explainItem(itemId, token) {
  const ds = await getIndustrialData2(token);
  const f = forecastAll(ds).find((x) => x.item.id === itemId);
  if (!f) throw new Error("Unknown item");
  const sup = ds.suppliers.find((s) => s.id === f.item.supplierId);
  const facts = {
    item: f.item.name,
    sku: f.item.id,
    warehouse: ds.warehouses.find((w) => w.id === f.item.warehouseId)?.name,
    currentStock: f.item.stock,
    minimumStock: f.item.minStock,
    avgDailyUseLast30Days: +f.avgDaily30.toFixed(2),
    forecastDailyUseNext30Days: +f.forecastDaily30.toFixed(2),
    demandTrendPct: +(f.trendPct * 100).toFixed(1),
    forecastAccuracyBacktestPct: +(f.accuracy * 100).toFixed(0),
    unitsOnOrder: f.onOrder,
    daysUntilBelowMinimum: f.daysToCritical,
    daysUntilStockout: f.daysToStockout,
    supplier: sup?.name,
    leadTimeDays: f.item.leadTimeDays,
    recommendedOrderQty: f.recommendedQty,
    recommendedOrderValueAED: Math.round(f.recommendedCost),
    orderBy: f.orderBy,
    basis: "Holt-Winters forecast on 12 months of daily consumption with weekly seasonality"
  };
  const { message } = await sarvamChat({
    messages: [
      { role: "system", content: SYSTEM2.replace("maintenance or operations manager", "procurement or warehouse manager") },
      { role: "user", content: `Facts (JSON):
${JSON.stringify(facts)}` }
    ],
    maxTokens: 400,
    temperature: 0.2
  });
  return { explanation: (message.content ?? "").trim() };
}

// src/server/apiHandler.ts
function sendJson(res, statusCode, data) {
  if (typeof res.status === "function" && typeof res.json === "function") {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(data));
}
function parseJsonBody(req) {
  if (req.body) {
    if (typeof req.body === "string") {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch (e) {
        return Promise.resolve({});
      }
    }
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on("error", reject);
  });
}
async function handleApiRequest(req, res) {
  const urlObj = new URL(req.url || "/", "http://localhost");
  const pathname = urlObj.pathname;
  const method = req.method?.toUpperCase();
  if (pathname.startsWith("/api/scio/") && method === "POST") {
    const ip = String(req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown").split(",")[0].trim();
    if (!sarvamConfigured()) {
      sendJson(res, 503, { error: "AI service is not configured (SARVAM_API_KEY missing)." });
      return true;
    }
    if (rateLimited(ip, pathname.endsWith("/vision") ? 15 : 40)) {
      sendJson(res, 429, { error: "Too many requests. Please wait a few minutes and try again." });
      return true;
    }
    try {
      const body = await parseJsonBody(req);
      const scioToken = typeof req.headers["x-scio-token"] === "string" ? req.headers["x-scio-token"] : void 0;
      if (pathname === "/api/scio/copilot") {
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        if (!question) {
          sendJson(res, 400, { error: "Question is required" });
          return true;
        }
        const history = Array.isArray(body?.history) ? body.history.filter((t) => (t?.role === "user" || t?.role === "assistant") && typeof t?.content === "string").slice(-8) : [];
        sendJson(res, 200, await runCopilot(question, history, scioToken));
        return true;
      }
      if (pathname === "/api/scio/retail-copilot") {
        const question = typeof body?.question === "string" ? body.question.trim() : "";
        if (!question) {
          sendJson(res, 400, { error: "Question is required" });
          return true;
        }
        const history = Array.isArray(body?.history) ? body.history.filter((t) => (t?.role === "user" || t?.role === "assistant") && typeof t?.content === "string").slice(-8) : [];
        const scopeStores = Array.isArray(body?.scope) ? body.scope.filter((n) => Number.isInteger(n)).slice(0, 60) : null;
        sendJson(res, 200, await runRetailCopilot(question, history, Array.isArray(body?.events) ? body.events : [], scopeStores, scioToken));
        return true;
      }
      if (pathname === "/api/scio/vision") {
        sendJson(res, 200, await runVision(body?.image, body?.previousImage ?? null));
        return true;
      }
      if (pathname === "/api/scio/document") {
        sendJson(res, 200, await processDocument(body?.text, body?.sector === "retail" ? "retail" : "industrial", scioToken));
        return true;
      }
      if (pathname === "/api/scio/explain") {
        const id = typeof body?.id === "string" ? body.id : "";
        sendJson(res, 200, body?.kind === "item" ? await explainItem(id, scioToken) : await explainAsset(id, scioToken));
        return true;
      }
    } catch (error) {
      if (error instanceof NotSignedInError) {
        sendJson(res, 401, { error: error.message });
        return true;
      }
      const msg = String(error?.message || "");
      if (/^(Image (must|is too)|Document text is empty|Unknown (asset|item))/.test(msg)) {
        sendJson(res, 400, { error: msg });
        return true;
      }
      console.error("SCIO demo API error:", error);
      sendJson(res, 502, { error: error?.message?.startsWith("Sarvam API") ? "The AI service is temporarily unavailable. Please try again." : error?.message || "Request failed" });
      return true;
    }
  }
  if (pathname === "/api/copilot" && method === "POST") {
    try {
      const body = await parseJsonBody(req);
      const { query, industry = "energy" } = body;
      if (!query || typeof query !== "string") {
        sendJson(res, 400, { error: "Query is required" });
        return true;
      }
      const result = await generateResponse(industry, query);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Failed to process query" });
    }
    return true;
  }
  if (pathname === "/api/chatbot/history") {
    const industry = urlObj.searchParams.get("industry") || "home";
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
    if (method === "GET") {
      try {
        if (!convexUrl) {
          sendJson(res, 200, { success: false, messages: [], reason: "Convex URL not configured" });
          return true;
        }
        const client2 = new ConvexHttpClient(convexUrl);
        const history = await client2.query(api.queries.getChatHistory, { industry });
        const formattedMessages = history.map((record) => ({
          id: record._id,
          sender: record.sender,
          text: record.text,
          timestamp: record.timestamp,
          provider: record.provider,
          suggestedAction: record.suggestedAction
        }));
        sendJson(res, 200, { success: true, messages: formattedMessages });
      } catch (err) {
        console.warn("Failed to fetch chat history from Convex:", err);
        sendJson(res, 200, { success: false, messages: [], error: err?.message || String(err) });
      }
      return true;
    }
    if (method === "DELETE") {
      try {
        if (!convexUrl) {
          sendJson(res, 200, { success: false, reason: "Convex URL not configured" });
          return true;
        }
        const client2 = new ConvexHttpClient(convexUrl);
        await client2.mutation(api.mutations.clearChatHistory, { industry });
        sendJson(res, 200, { success: true });
      } catch (err) {
        console.warn("Failed to clear chat history in Convex:", err);
        sendJson(res, 200, { success: false, error: err?.message || String(err) });
      }
      return true;
    }
  }
  const chatbotMatch = pathname.match(/^\/api\/chatbot\/(energy|maritime|manufacturing|logistics|homepage)$/);
  if (chatbotMatch && method === "POST") {
    const sector = chatbotMatch[1];
    try {
      const body = await parseJsonBody(req);
      const { query } = body;
      if (!query || typeof query !== "string") {
        sendJson(res, 400, { error: "Query is required" });
        return true;
      }
      const result = await generateResponse(sector, query);
      sendJson(res, 200, result);
    } catch (error) {
      sendJson(res, 500, { error: error.message || "Failed to process query" });
    }
    return true;
  }
  return false;
}

// src/server/vercelEntry.ts
async function handler(req, res) {
  const url = new URL(req.url || "/api", "http://localhost");
  const original = url.searchParams.get("__p");
  if (original !== null) {
    url.searchParams.delete("__p");
    const qs = url.searchParams.toString();
    req.url = `/api/${original.replace(/^\/+/, "")}${qs ? `?${qs}` : ""}`;
  }
  const handled = await handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  }
}
export {
  handler as default
};
