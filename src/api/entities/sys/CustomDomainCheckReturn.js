// @flow

import {create, TypeRef} from "../../common/EntityFunctions"

export const CustomDomainCheckReturnTypeRef: TypeRef<CustomDomainCheckReturn> = new TypeRef("sys", "CustomDomainCheckReturn")
export const _TypeModel: TypeModel = {
	"name": "CustomDomainCheckReturn",
	"since": 49,
	"type": "DATA_TRANSFER_TYPE",
	"id": 1589,
	"rootId": "A3N5cwAGNQ",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"name": "_format",
			"id": 1590,
			"since": 49,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		},
		"checkResult": {
			"name": "checkResult",
			"id": 1591,
			"since": 49,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}
	},
	"associations": {
		"invalidRecords": {
			"name": "invalidRecords",
			"id": 1593,
			"since": 49,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"refType": "DnsRecord",
			"final": false
		},
		"missingRecords": {
			"name": "missingRecords",
			"id": 1592,
			"since": 49,
			"type": "AGGREGATION",
			"cardinality": "Any",
			"refType": "DnsRecord",
			"final": false
		}
	},
	"app": "sys",
	"version": "50"
}

export function createCustomDomainCheckReturn(values?: $Shape<$Exact<CustomDomainCheckReturn>>): CustomDomainCheckReturn {
	return Object.assign(create(_TypeModel, CustomDomainCheckReturnTypeRef), values)
}
