// @flow

import {create, TypeRef} from "../../common/EntityFunctions"

export const BrandingDomainDeleteDataTypeRef: TypeRef<BrandingDomainDeleteData> = new TypeRef("sys", "BrandingDomainDeleteData")
export const _TypeModel: TypeModel = {
	"name": "BrandingDomainDeleteData",
	"since": 22,
	"type": "DATA_TRANSFER_TYPE",
	"id": 1155,
	"rootId": "A3N5cwAEgw",
	"versioned": false,
	"encrypted": false,
	"values": {
		"_format": {
			"name": "_format",
			"id": 1156,
			"since": 22,
			"type": "Number",
			"cardinality": "One",
			"final": false,
			"encrypted": false
		}, "domain": {"name": "domain", "id": 1157, "since": 22, "type": "String", "cardinality": "One", "final": true, "encrypted": false}
	},
	"associations": {},
	"app": "sys",
	"version": "50"
}

export function createBrandingDomainDeleteData(values?: $Shape<$Exact<BrandingDomainDeleteData>>): BrandingDomainDeleteData {
	return Object.assign(create(_TypeModel, BrandingDomainDeleteDataTypeRef), values)
}
