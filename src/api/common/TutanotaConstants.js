// @flow

import {downcast} from "./utils/Utils"

export const GroupType = Object.freeze({
	User: "0",
	Admin: "1",
	MailingList: "2",
	Customer: "3",
	External: "4",
	Mail: "5",
	Contact: "6",
	File: "7",
	LocalAdmin: "8",
	Calendar: "9"
})
export type GroupTypeEnum = $Values<typeof GroupType>;
export const getMembershipGroupType = (membership: GroupMembership) => downcast(membership.groupType)

export const PermissionType = Object.freeze({
	Public: "0",
	Symmetric: "1",
	Public_Symmetric: "2", // instances without ownerEncSessionKey (e.g. MailBody, FileData) after asymmetric decryption
	Unencrypted: "3",
	External: "5",
	Owner_List: "8"
})
export type PermissionTypeEnum = $Values<typeof PermissionType>;

export const BucketPermissionType = Object.freeze({
	Public: "2",
	External: "3"
})
export type BucketPermissionTypeEnum = $Values<typeof BucketPermissionType>;

export const MailFolderType = Object.freeze({
	CUSTOM: '0',
	INBOX: '1',
	SENT: '2',
	TRASH: '3',
	ARCHIVE: '4',
	SPAM: '5',
	DRAFT: '6'
})
export const getMailFolderType = (folder: MailFolder): MailFolderTypeEnum => downcast(folder.folderType)

export type MailFolderTypeEnum = $Values<typeof MailFolderType>;

export const ReplyType = Object.freeze({
	NONE: '0',
	REPLY: '1',
	FORWARD: '2',
	REPLY_FORWARD: '3'
})
export type ReplyTypeEnum = $Values<typeof ReplyType>;

export const ContactAddressType = Object.freeze({
	PRIVATE: '0',
	WORK: '1',
	OTHER: '2',
	CUSTOM: '3'
})
export type ContactAddressTypeEnum = $Values<typeof ContactAddressType>;

export const ContactPhoneNumberType = Object.freeze({
	PRIVATE: '0',
	WORK: '1',
	MOBILE: '2',
	FAX: '3',
	OTHER: '4',
	CUSTOM: '5'
})
export type ContactPhoneNumberTypeEnum = $Values<typeof ContactPhoneNumberType>;

export const ContactSocialType = Object.freeze({
	TWITTER: '0',
	FACEBOOK: '1',
	XING: '2',
	LINKED_IN: '3',
	OTHER: '4',
	CUSTOM: '5'
})
export type ContactSocialTypeEnum = $Values<typeof ContactSocialType>;
export const getContactSocialType = (contactSocialId: ContactSocialId): ContactSocialTypeEnum => downcast(contactSocialId.type)

export const OperationType = {
	CREATE: '0',
	UPDATE: '1',
	DELETE: '2'
}
export type OperationTypeEnum = $Values<typeof OperationType>;

export const AccountType = Object.freeze({
	FREE: '1',
	STARTER: '2',
	PREMIUM: '3',
	EXTERNAL: '5'
})
export type AccountTypeEnum = $Values<typeof AccountType>;


export const AccountTypeNames = ["System", "Free", "Outlook", "Premium", "Stream", "External"]

export const BookingItemFeatureType = Object.freeze({
	Users: '0',
	Storage: '1',
	Alias: '2',
	SharedMailGroup: '3',
	Branding: '4',
	ContactForm: '5',
	WhitelabelChild: '6',
	LocalAdminGroup: '7',
	Discount: '8'
})
export type BookingItemFeatureTypeEnum = $Values<typeof BookingItemFeatureType>;


export const PaymentMethodType = Object.freeze({
	Invoice: '0',
	CreditCard: '1',
	Sepa: '2',
	Paypal: '3'
})
export type PaymentMethodTypeEnum = $Values<typeof PaymentMethodType>;
export const getPaymentMethodType = (accountingInfo: AccountingInfo): PaymentMethodTypeEnum => downcast(accountingInfo.paymentMethod)

export const reverse = (objectMap: Object) => Object.keys(objectMap)
                                                    .reduce((r, k) => Object.assign(r, {[objectMap[k]]: k}), {})

export const ValueToPaymentMethodType = reverse(PaymentMethodType)


export const Const = {
	UPGRADE_REMINDER_INTERVAL: 14 * 24 * 60 * 60 * 1000,
	MEMORY_GB_FACTOR: 1000000000,
	MEMORY_WARNING_FACTOR: 0.9,
	COUNTER_USED_MEMORY_INTERNAL: "UsedMemoryInternalNew",
	COUNTER_USED_MEMORY_EXTERNAL: "UsedMemoryExternalNew",
	COUNTER_USED_MEMORY: "UsedMemoryNew",
	CURRENT_DATE: null, // Sets the current date for testing date dependent services. Only available in test environments.
	CURRENCY_SYMBOL_EUR: "€",
}

export const TUTANOTA_MAIL_ADDRESS_DOMAINS = ["tutanota.com", "tutanota.de", "tutamail.com", "tuta.io", "keemail.me"]

export const ConversationType = Object.freeze({
	NEW: '0',
	REPLY: '1',
	FORWARD: '2',
})
export type ConversationTypeEnum = $Values<typeof ConversationType>;

export const MailState = Object.freeze({
	DRAFT: '0',
	SENT: '1',
	RECEIVED: '2',
	SENDING: '3'
})
export type MailStateEnum = $Values<typeof MailState>;

export const ApprovalState = Object.freeze({
	REGISTRATION_APPROVED: "0",
	REGISTRATION_APPROVAL_NEEDED: "1",
	SEND_MAILS_APPROVED: "2",
	INVOICE_NOT_PAID: "3",
})
export type ApprovalStateEnum = $Values<typeof ApprovalState>;


export const InboxRuleType = Object.freeze({
	FROM_EQUALS: "0",
	RECIPIENT_TO_EQUALS: "1",
	RECIPIENT_CC_EQUALS: "2",
	RECIPIENT_BCC_EQUALS: "3",
	SUBJECT_CONTAINS: "4",
	MAIL_HEADER_CONTAINS: "5"
})
export type InboxRuleTypeEnum = $Values<typeof InboxRuleType>;

export const SpamRuleType = Object.freeze({
	WHITELIST: "1",
	BLACKLIST: "2",
	DISCARD: "3",
})
export type SpamRuleTypeEnum = $Values<typeof SpamRuleType>;

export const EmailSignatureType = Object.freeze({
	EMAIL_SIGNATURE_TYPE_DEFAULT: "0",
	EMAIL_SIGNATURE_TYPE_CUSTOM: "1",
	EMAIL_SIGNATURE_TYPE_NONE: "2",
})
export type EmailSignatureTypeEnum = $Values<typeof EmailSignatureType>;

export const CustomDomainValidationResult = Object.freeze({
	CUSTOM_DOMAIN_VALIDATION_RESULT_OK: "0",
	CUSTOM_DOMAIN_VALIDATION_RESULT_DNS_LOOKUP_FAILED: "1",
	CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_FOUND: "2",
	CUSTOM_DOMAIN_VALIDATION_RESULT_NAMESERVER_NOT_FOUND: "3",
	CUSTOM_DOMAIN_VALIDATION_RESULT_DOMAIN_NOT_AVAILABLE: "4",
	CUSTOM_DOMAIN_VALIDATION_RESULT_VALIDATION_FAILED: "5"
})
export type CustomDomainValidationResultEnum = $Values<typeof CustomDomainValidationResult>;

export const CustomDomainCheckResult = Object.freeze({
	CUSTOM_DOMAIN_CHECK_RESULT_OK: "0",
	CUSTOM_DOMAIN_CHECK_RESULT_DNS_LOOKUP_FAILED: "1",
	CUSTOM_DOMAIN_CHECK_RESULT_DOMAIN_NOT_FOUND: "2",
	CUSTOM_DOMAIN_CHECK_RESULT_NAMESERVER_NOT_FOUND: "3",
})
export type CustomDomainCheckResultEnum = $Values<typeof CustomDomainCheckResult>;

export const DnsRecordType = Object.freeze({
	DNS_RECORD_TYPE_MX: "0",
	DNS_RECORD_TYPE_TXT_SPF: "1",
	DNS_RECORD_TYPE_CNAME_DKIM: "2",
	DNS_RECORD_TYPE_TXT_DMARC: "3",
})
export type DnsRecordTypeEnum = $Values<typeof DnsRecordType>;

export const DnsRecordTypeToName = Object.freeze({
	"0": "MX",
	"1": "TXT",
	"2": "CNAME",
	"3": "TXT",
})

export const SessionState = Object.freeze({
	SESSION_STATE_ACTIVE: "0",
	SESSION_STATE_EXPIRED: "1",
	SESSION_STATE_DELETED: "2",
	SESSION_STATE_PENDING: "3",
})
export type SessionStateEnum = $Values<typeof SessionState>;

export const PushServiceType = Object.freeze({
	ANDROID: "0",
	IOS: "1",
	EMAIL: "2",
	SSE: "3"
})
export type PushServiceTypeEnum = $Values<typeof PushServiceType>;

export const InputFieldType = Object.freeze({
	TEXT: "0",
	NUMBER: "1",
	ENUM: "2"
})
export type InputFieldTypeEnum = $Values<typeof InputFieldType>;

export const EntropySrc = Object.freeze({
	mouse: "mouse",
	touch: "touch",
	key: "key",
	random: "random",
	static: "static",
	time: "time",
	accelerometer: "accel"
})
export type EntropySrcEnum = $Values<typeof EntropySrc>;

export const SecondFactorType = Object.freeze({
	u2f: "0",
	totp: "1"
})
export type SecondFactorTypeEnum = $Values<typeof SecondFactorType>;

export const MAX_ATTACHMENT_SIZE = 1024 * 1024 * 25
export const MAX_LOGO_SIZE = 1024 * 100
export const MAX_BASE64_IMAGE_SIZE = MAX_LOGO_SIZE

export const ALLOWED_IMAGE_FORMATS = ["png", "jpg", "jpeg", "svg"]

export const FeatureType = Object.freeze({
	DisableContacts: "0",
	DisableMailExport: "1",
	InternalCommunication: "2",
	DeleteMailsOnPasswordReset: "3",
	WhitelabelParent: "4",
	WhitelabelChild: "5",
	ReplyOnly: "6",
	DisableDefaultSignature: "7",
	HideBuyDialogs: "8",
	DisableCalendar: "9",
})
export type FeatureTypeEnum = $Values<typeof FeatureType>;
export const ValueToFeatureType = reverse(FeatureType)

export const BootstrapFeatureType = Object.freeze({
	DisableSavePassword: "0",
})
export type BootstrapFeatureTypeEnum = $Values<typeof BootstrapFeatureType>;

export const FULL_INDEXED_TIMESTAMP: number = 0
export const NOTHING_INDEXED_TIMESTAMP: number = Math.pow(2, 42) - 1 // maximum Timestamp is 42 bit long (see GeneratedIdData.java)


export const PaymentDataResultType = Object.freeze({
	OK: "0",
	COUNTRY_MISMATCH: "1",
	INVALID_VATID_NUMBER: "2",
	CREDIT_CARD_DECLINED: "3",
	CREDIT_CARD_CVV_INVALID: "4",
	PAYMENT_PROVIDER_NOT_AVAILABLE: "5",
	OTHER_PAYMENT_PROVIDER_ERROR: "6",
	OTHER_PAYMENT_ACCOUNT_REJECTED: "7",
	COULD_NOT_VERIFY_VATID: "8",
	CREDIT_CARD_DATE_INVALID: "9",
	CREDIT_CARD_NUMBER_INVALID: "10"
})

export const ContactComparisonResult = Object.freeze({
	Unique: "unique",
	Similar: "similar",
	Equal: "equal",
})
export type ContactComparisonResultEnum = $Values<typeof ContactComparisonResult>;

export const IndifferentContactComparisonResult = Object.freeze({
	OneEmpty: "oneEmpty",
	BothEmpty: "bothEmpty",
})
export type IndifferentContactComparisonResultEnum = $Values<typeof IndifferentContactComparisonResult>;

export const ContactMergeAction = Object.freeze({
	DeleteFirst: "deleteFirst",
	DeleteSecond: "deleteSecond",
	Merge: "merge",
	Skip: "skip",
	Cancel: "cancel"
})
export type ContactMergeActionEnum = $Values<typeof ContactMergeAction>;


export const InvoiceStatus = Object.freeze({
	CREATED: "0",
	PUBLISHEDFORAUTOMATIC: "1",
	PUBLISHEDFORMANUAL: "2",
	PAID: "3",
	DEBITFAILED: "4",
	DISPUTED: "5",
	CANCELLED: "6",
	PARTNERMANAGED: "7",
	FIRSTREMINDER: "8",
	REFUNDED: "9",
	DISPUTEACCEPTED: "10",
	SECONDREMINDER: "11"
})
export type InvoiceStatusEnum = $Values<typeof InvoiceStatus>;
export const ValueToInvoiceStatus = reverse(FeatureType)

export const CloseEventBusOption = Object.freeze({
	Terminate: "terminate",
	Reconnect: "reconnect",
	Pause: "pause"
})
export type CloseEventBusOptionEnum = $Values<typeof CloseEventBusOption>;

export const Announcement = Object.freeze({
	None: '0',
	StorageDeletion: '1'
})

export const CertificateState = Object.freeze({
	VALID: '0',
	VALIDATING: '1',
	INVALID: '2'
})
export type CertificateStateEnum = $Values<typeof CertificateState>

export const CertificateType = Object.freeze({
	MANUAL: '0',
	LETS_ENCRYPT: '1',
})
export type CertificateTypeEnum = $Values<typeof CertificateType>

export function getCertificateType(certificateInfo: CertificateInfo): CertificateTypeEnum {
	return downcast(certificateInfo.type)
}

export const RepeatPeriod = Object.freeze({
	DAILY: "0",
	WEEKLY: "1",
	MONTHLY: "2",
	ANNUALLY: "3",
})
export type RepeatPeriodEnum = $Values<typeof RepeatPeriod>

export const EndType = Object.freeze({
	Never: "0",
	Count: "1",
	UntilDate: "2"
})
export type EndTypeEnum = $Values<typeof EndType>

export const defaultCalendarColor = "2196f3"


export const AlarmInterval = Object.freeze({
	FIVE_MINUTES: "5M",
	TEN_MINUTES: "10M",
	THIRTY_MINUTES: "30M",
	ONE_HOUR: "1H",
	ONE_DAY: "1D",
	TWO_DAYS: "2D",
	THREE_DAYS: "3D",
	ONE_WEEK: "1W",
})
export type AlarmIntervalEnum = $Values<typeof AlarmInterval>


export const EventTextTimeOption = Object.freeze({
	NO_TIME: "noTime",
	START_TIME: "startTime",
	END_TIME: "endTime",
	START_END_TIME: "startAndEndTime",
	ALL_DAY: "allDay"
})
export type EventTextTimeOptionEnum = $Values<typeof EventTextTimeOption>;

export const TimeFormat = Object.freeze({
	TWENTY_FOUR_HOURS: '0',
	TWELVE_HOURS: '1',
})
export type TimeFormatEnum = $Values<typeof TimeFormat>

export const WeekStart = Object.freeze({
	MONDAY: '0',
	SUNDAY: '1',
})

export function getWeekStart(userSettings: UserSettingsGroupRoot): WeekStartEnum {
	return downcast(userSettings.startOfTheWeek)
}


export type WeekStartEnum = $Values<typeof WeekStart>

export const SECOND_MS = 1000
