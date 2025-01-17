// @flow
import m from "mithril"
import {assertMainOrNode, isIOSApp} from "../api/Env"
import type {AccountTypeEnum} from "../api/common/TutanotaConstants"
import {AccountType, AccountTypeNames, BookingItemFeatureType, Const} from "../api/common/TutanotaConstants"
import {CustomerTypeRef} from "../api/entities/sys/Customer"
import {downcast, neverNull} from "../api/common/utils/Utils"
import {CustomerInfoTypeRef} from "../api/entities/sys/CustomerInfo"
import {load, loadRange, serviceRequest} from "../api/main/Entity"
import {logins} from "../api/main/LoginController"
import {lang} from "../misc/LanguageViewModel.js"
import {Button, ButtonType} from "../gui/base/Button"
import {TextField} from "../gui/base/TextField"
import {Icons} from "../gui/base/icons/Icons"
import {AccountingInfoTypeRef} from "../api/entities/sys/AccountingInfo"
import {worker} from "../api/main/WorkerClient"
import {GENERATED_MAX_ID, HttpMethod} from "../api/common/EntityFunctions"
import {UserTypeRef} from "../api/entities/sys/User"
import {createNotAvailableForFreeButton, formatPriceDataWithInfo, getCurrentCount} from "./PriceUtils"
import {formatDate, formatNameAndAddress, formatStorageSize} from "../misc/Formatter"
import {getByAbbreviation} from "../api/common/CountryList"
import {BookingTypeRef} from "../api/entities/sys/Booking"
import {SysService} from "../api/entities/sys/Services"
import {MailAddressAliasServiceReturnTypeRef} from "../api/entities/sys/MailAddressAliasServiceReturn"
import * as AddUserDialog from "../settings/AddUserDialog"
import * as EmailAliasOptionsDialog from "./EmailAliasOptionsDialog"
import * as AddGroupDialog from "../settings/AddGroupDialog"
import * as ContactFormEditor from "../settings/ContactFormEditor"
import * as WhitelabelBuyDialog from "./WhitelabelBuyDialog"
import * as StorageCapacityOptionsDialog from "./StorageCapacityOptionsDialog"
import {showUpgradeWizard} from "./UpgradeSubscriptionWizard"
import {showSwitchDialog} from "./SwitchSubscriptionDialog"
import {DropDownSelector} from "../gui/base/DropDownSelector"
import stream from "mithril/stream/stream.js"
import {showDeleteAccountDialog} from "./DeleteAccountDialog"
import {ExpanderButton, ExpanderPanel} from "../gui/base/Expander"
import {OrderProcessingAgreementTypeRef} from "../api/entities/sys/OrderProcessingAgreement"
import * as SignOrderAgreementDialog from "./SignOrderProcessingAgreementDialog"
import {GroupInfoTypeRef} from "../api/entities/sys/GroupInfo"
import * as InvoiceDataDialog from "./InvoiceDataDialog"
import {NotFoundError} from "../api/common/error/RestError"
import type {EntityUpdateData} from "../api/main/EventController"
import {isUpdateForTypeRef} from "../api/main/EventController"
import {Dialog} from "../gui/base/Dialog"
import {
	getIncludedAliases,
	getIncludedStorageCapacity,
	getSubscriptionType,
	getTotalAliases,
	getTotalStorageCapacity,
	isWhitelabelActive,
	SubscriptionType
} from "./SubscriptionUtils"

assertMainOrNode()

const DAY = 1000 * 60 * 60 * 24;

export class SubscriptionViewer implements UpdatableSettingsViewer {

	view: Function;
	_subscriptionField: TextField;
	_usageTypeField: TextField;
	_orderAgreementField: TextField;
	_subscriptionIntervalField: DropDownSelector<number>;
	_selectedSubscriptionInterval: Stream<number>;
	_currentPriceField: TextField;
	_nextPriceField: TextField;

	_usersField: TextField;
	_storageField: TextField;
	_emailAliasField: TextField;
	_groupsField: TextField;
	_contactFormsField: TextField;
	_whitelabelField: TextField;
	_periodEndDate: Date;
	_nextPeriodPriceVisible: boolean;
	_customer: ?Customer;
	_customerInfo: ?CustomerInfo;
	_accountingInfo: ?AccountingInfo;
	_lastBooking: ?Booking;
	_orderAgreement: ?OrderProcessingAgreement;
	_isPro: boolean;
	_isCancelled: boolean;

	constructor() {
		this._isPro = false
		this._subscriptionField = new TextField("subscription_label")
		let subscriptionAction = new Button("subscription_label", () => {
			if (isIOSApp()) {
				Dialog.error("notAvailableInApp_msg")
			} else if (this._accountingInfo && this._customer && this._customerInfo) {
				showSwitchDialog(this._accountingInfo,
					this._isPro,
					getTotalStorageCapacity(neverNull(this._customer), neverNull(this._customerInfo), this._lastBooking),
					getTotalAliases(neverNull(this._customer), neverNull(this._customerInfo), this._lastBooking),
					getIncludedStorageCapacity(neverNull(this._customerInfo)),
					getIncludedAliases(neverNull(this._customerInfo)),
					isWhitelabelActive(this._lastBooking))
			}
		}, () => Icons.Edit)

		let upgradeAction = new Button("upgrade_action", () => {
			if (isIOSApp()) {
				Dialog.error("notAvailableInApp_msg")
			} else {
				showUpgradeWizard()
			}
		}, () => Icons.Edit)

		this._subscriptionField._injectionsRight = () => (
			logins.getUserController().isFreeAccount())
			? m(upgradeAction)
			: (logins.getUserController().isPremiumAccount() && !this._isCancelled
				? [m(subscriptionAction)]
				: null)
		this._usageTypeField = new TextField("businessOrPrivateUsage_label")
			.setValue(lang.get("loading_msg"))
			.setDisabled()
		let usageTypeAction = new Button("pricing.businessUse_label", () => {
			if (isIOSApp()) {
				Dialog.error("notAvailableInApp_msg")
			} else {
				this._switchToBusinessUse()
			}
		}, () => Icons.Edit)
		this._usageTypeField._injectionsRight = () => this._accountingInfo
		&& !this._accountingInfo.business ? m(usageTypeAction) : null

		this._orderAgreementField = new TextField("orderProcessingAgreement_label", () => lang.get("orderProcessingAgreementInfo_msg"))
			.setValue(lang.get("loading_msg"))
			.setDisabled()
		let signOrderAgreementAction = new Button("sign_action", () => {
			SignOrderAgreementDialog.showForSigning(neverNull(this._customer), neverNull(this._accountingInfo))
		}, () => Icons.Edit)
		let showOrderAgreementAction = new Button("show_action", () => {
			load(GroupInfoTypeRef, neverNull(this._orderAgreement).signerUserGroupInfo).then(signerUserGroupInfo => {
				SignOrderAgreementDialog.showForViewing(neverNull(this._orderAgreement), signerUserGroupInfo)
			})
		}, () => Icons.Download)
		this._orderAgreementField._injectionsRight = () => {
			if (this._orderAgreement && this._customer && this._customer.orderProcessingAgreementNeeded) {
				return [m(signOrderAgreementAction), m(showOrderAgreementAction)]
			} else if (this._orderAgreement) {
				return [m(showOrderAgreementAction)]
			} else if (this._customer && this._customer.orderProcessingAgreementNeeded) {
				return [m(signOrderAgreementAction)]
			} else {
				return []
			}
		}

		//this._usageTypeField._injectionsRight = () => m(usageTypeAction)

		let subscriptionPeriods = [
			{name: lang.get("pricing.yearly_label") + ', ' + lang.get('automaticRenewal_label'), value: 12},
			{name: lang.get("pricing.monthly_label") + ', ' + lang.get('automaticRenewal_label'), value: 1}
		]
		this._selectedSubscriptionInterval = stream()
		this._subscriptionIntervalField = new DropDownSelector("subscriptionPeriod_label",
			() => this._periodEndDate ? lang.get("endOfSubscriptionPeriod_label", {"{1}": formatDate(this._periodEndDate)}) : "",
			subscriptionPeriods,
			this._selectedSubscriptionInterval,
			300).setSelectionChangedHandler(value => {
			if (this._accountingInfo) {
				changeSubscriptionInterval(this._accountingInfo, value)
			}
		})


		this._currentPriceField = new TextField(() => this._nextPeriodPriceVisible
			? lang.get("priceTill_label", {"{date}": formatDate(this._periodEndDate)})
			: lang.get("price_label"))
			.setValue(lang.get("loading_msg"))
			.setDisabled()
		this._nextPriceField = new TextField(() => lang.get("priceFrom_label", {
			"{date}": formatDate(new Date(this._periodEndDate.getTime() + DAY))
		}), () => lang.get("nextSubscriptionPrice_msg")).setValue(lang.get("loading_msg")).setDisabled()

		this._usersField = new TextField("bookingItemUsers_label").setValue(lang.get("loading_msg")).setDisabled()
		const addUserActionButton = createNotAvailableForFreeButton("addUsers_action", () => AddUserDialog.show(), () => Icons.Add, false);
		const editUsersAction = createNotAvailableForFreeButton("bookingItemUsers_label", () => m.route.set("/settings/users"), () => Icons.Edit, false)
		this._usersField._injectionsRight = () => [m(addUserActionButton), m(editUsersAction)]

		this._storageField = new TextField("storageCapacity_label").setValue(lang.get("loading_msg")).setDisabled()
		const changeStorageCapacityButton = createNotAvailableForFreeButton("storageCapacity_label", () => {
			StorageCapacityOptionsDialog.show()
		}, () => Icons.Edit, false)
		this._storageField._injectionsRight = () => m(changeStorageCapacityButton)

		this._emailAliasField = new TextField("mailAddressAliases_label")
			.setValue(lang.get("loading_msg"))
			.setDisabled()
		const changeEmailAliasPackageButton = createNotAvailableForFreeButton("emailAlias_label", () => {
			EmailAliasOptionsDialog.show()
		}, () => Icons.Edit, true)
		this._emailAliasField._injectionsRight = () => m(changeEmailAliasPackageButton)

		this._groupsField = new TextField("groups_label").setValue(lang.get("loading_msg")).setDisabled()
		const addGroupsAction = createNotAvailableForFreeButton("addGroup_label", () => {
			AddGroupDialog.show()
		}, () => Icons.Add, false)
		const editGroupsAction = createNotAvailableForFreeButton("groups_label", () => m.route.set("/settings/groups"), () => Icons.Edit, false)
		this._groupsField._injectionsRight = () => [m(addGroupsAction), m(editGroupsAction)]

		this._contactFormsField = new TextField("contactForms_label").setValue(lang.get("loading_msg")).setDisabled()
		const addContactFormAction = createNotAvailableForFreeButton("createContactForm_label", () => {
			ContactFormEditor.show(null, true, contactFormId => {
			})
		}, () => Icons.Add, false)
		const editContactFormsAction = createNotAvailableForFreeButton("contactForms_label", () => m.route.set("/settings/contactforms"), () => Icons.Edit, false)
		this._contactFormsField._injectionsRight = () => [m(addContactFormAction), m(editContactFormsAction)]

		this._whitelabelField = new TextField("whitelabel_label").setValue(lang.get("loading_msg")).setDisabled()
		const enableWhiteLabelAction = createNotAvailableForFreeButton("whitelabelDomain_label", () => WhitelabelBuyDialog.show(true), () => Icons.Edit, false)
		const disableWhiteLabelAction = createNotAvailableForFreeButton("whitelabelDomain_label", () => WhitelabelBuyDialog.show(false), () => Icons.Cancel, false)
		this._whitelabelField._injectionsRight = () => (getCurrentCount(BookingItemFeatureType.Branding, this._lastBooking)
			=== 0) ? m(enableWhiteLabelAction) : m(disableWhiteLabelAction)

		let deleteButton = new Button("adminDeleteAccount_action", () => {
			showDeleteAccountDialog()
		}).setType(ButtonType.Login)
		let deleteAccountExpander = new ExpanderButton("adminDeleteAccount_action", new ExpanderPanel({
			view: () => m(".flex-center.mb-l", m("", {style: {"width": '200px'}}, m(deleteButton)))
		}), false)

		this.view = (): VirtualElement => {
			return m("#subscription-settings.fill-absolute.scroll.plr-l", [
				m(".h4.mt-l", lang.get('currentlyBooked_label')),
				m(this._subscriptionField),
				this._showPriceData() ? m(this._usageTypeField) : null,
				this._showOrderAgreement() ? m(this._orderAgreementField) : null,
				this._showPriceData() ? m(this._subscriptionIntervalField) : null,
				this._showPriceData() ? m(this._currentPriceField) : null,
				(this._showPriceData() && this._nextPeriodPriceVisible) ? m(this._nextPriceField) : null,
				m(".h4.mt-l", lang.get('adminPremiumFeatures_action')),
				m(this._usersField),
				m(this._storageField),
				m(this._emailAliasField),
				m(this._groupsField),
				m(this._whitelabelField),
				m(this._contactFormsField),
				m(".flex-space-between.items-center.mt-l.mb", [
					m(".h4", lang.get('adminDeleteAccount_action')),
					m(deleteAccountExpander)
				]),
				m(deleteAccountExpander.panel),
			])
		}

		load(CustomerTypeRef, neverNull(logins.getUserController().user.customer))
			.then(customer => {
				this._updateOrderProcessingAgreement(customer)
				return load(CustomerInfoTypeRef, customer.customerInfo)
			})
			.then(customerInfo => {
				this._customerInfo = customerInfo
				return load(AccountingInfoTypeRef, customerInfo.accountingInfo)
			})
			.then(accountingInfo => {
				this._updateAccountInfoData(accountingInfo)
			})
		this._subscriptionField.setValue(lang.get("loading_msg")).setDisabled()
		this._updatePriceInfo()
		this._updateBookings()
	}

	_showOrderAgreement(): boolean {
		return (logins.getUserController().isPremiumAccount() || logins.getUserController().isOutlookAccount())
			&& (this._accountingInfo != null && this._accountingInfo.business
				|| this._customer != null && (this._customer.orderProcessingAgreement != null || this._customer.orderProcessingAgreementNeeded))
	}

	_updateOrderProcessingAgreement(customer: Customer) {
		let p = Promise.resolve()
		this._customer = customer
		if (this._customer.orderProcessingAgreement) {
			p = load(OrderProcessingAgreementTypeRef, this._customer.orderProcessingAgreement).then(a => {
				this._orderAgreement = a
			})
		} else {
			this._orderAgreement = null
		}
		p.then(() => {
			if (customer.orderProcessingAgreementNeeded) {
				this._orderAgreementField.setValue(lang.get("signingNeeded_msg"))
			} else if (this._orderAgreement) {
				this._orderAgreementField.setValue(lang.get("signedOn_msg", {"{date}": formatDate(this._orderAgreement.signatureDate)}))
			} else {
				this._orderAgreementField.setValue(lang.get("notSigned_msg"))
			}
			m.redraw()
		})
	}

	_switchToBusinessUse(): void {
		if (this._accountingInfo && !this._accountingInfo.business) {
			let accountingInfo = neverNull(this._accountingInfo)
			const invoiceCountry = neverNull(getByAbbreviation(neverNull(accountingInfo.invoiceCountry)))
			InvoiceDataDialog.show({
				businessUse: stream(true),
				paymentInterval: stream(Number(accountingInfo.paymentInterval)),
			}, {
				invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
				country: invoiceCountry,
				vatNumber: ""
			}, "pricing.businessUse_label", "businessChangeInfo_msg")
		}
	}

	_showPriceData(): boolean {
		return logins.getUserController().isPremiumAccount() || logins.getUserController().isOutlookAccount()
	}

	_updatePriceInfo() {
		if (!this._showPriceData()) {
			return;
		}
		worker.getCurrentPrice().then(priceServiceReturn => {
			if (priceServiceReturn.currentPriceThisPeriod != null && priceServiceReturn.currentPriceNextPeriod
				!= null) {
				if (priceServiceReturn.currentPriceThisPeriod.price
					!== priceServiceReturn.currentPriceNextPeriod.price) {
					this._currentPriceField.setValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod))
					this._nextPriceField.setValue(formatPriceDataWithInfo(neverNull(priceServiceReturn.currentPriceNextPeriod)))
					this._nextPeriodPriceVisible = true
				} else {
					this._currentPriceField.setValue(formatPriceDataWithInfo(priceServiceReturn.currentPriceThisPeriod))
					this._nextPeriodPriceVisible = false
				}
				this._periodEndDate = priceServiceReturn.periodEndDate
				m.redraw()
			}
		})
	}

	_updateAccountInfoData(accountingInfo: AccountingInfo) {
		this._accountingInfo = accountingInfo
		this._usageTypeField.setValue(accountingInfo.business ? lang.get("pricing.businessUse_label") : lang.get("pricing.privateUse_label"))
		this._selectedSubscriptionInterval(Number(accountingInfo.paymentInterval))

		m.redraw()
	}

	_updateSubscriptionField(cancelled: boolean) {
		let cancelledText = !cancelled ? "" : " "
			+ lang.get("cancelledBy_label", {"{endOfSubscriptionPeriod}": formatDate(this._periodEndDate)})
		const accountType: AccountTypeEnum = downcast(logins.getUserController().user.accountType)
		this._subscriptionField.setValue(_getAccountTypeName(accountType, this._isPro) + cancelledText).setDisabled()
	}

	_updateBookings() {
		load(CustomerTypeRef, neverNull(logins.getUserController().user.customer)).then(customer => {
			load(CustomerInfoTypeRef, customer.customerInfo)
				.catch(NotFoundError, e => console.log("could not update bookings as customer info does not exist (moved between free/premium lists)"))
				.then(customerInfo => {
					if (!customerInfo) {
						return
					}
					this._customerInfo = customerInfo
					loadRange(BookingTypeRef, neverNull(customerInfo.bookings).items, GENERATED_MAX_ID, 1, true)
						.then(bookings => {
							this._lastBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null
							this._isCancelled = customer.canceledPremiumAccount
							this._isPro = getSubscriptionType(this._lastBooking, customer, customerInfo) === SubscriptionType.Pro
							this._updateSubscriptionField(this._isCancelled)
							Promise.all([
									this._updateUserField(),
									this._updateStorageField(customer, customerInfo),
									this._updateAliasField(customer, customerInfo),
									this._updateGroupsField(),
									this._updateWhitelabelField(),
									this._updateContactFormsField()
								]
							).then(() => m.redraw())
						})
				})
		})
	}


	_updateUserField(): Promise<void> {
		this._usersField.setValue("" + Math.max(1, getCurrentCount(BookingItemFeatureType.Users, this._lastBooking)))
		return Promise.resolve()
	}

	_updateStorageField(customer: Customer, customerInfo: CustomerInfo): Promise<void> {
		return worker.readUsedCustomerStorage().then(usedStorage => {
			const usedStorageFormatted = formatStorageSize(Number(usedStorage))
			const totalStorageFormatted = formatStorageSize(getTotalStorageCapacity(customer, customerInfo, this._lastBooking)
				* Const.MEMORY_GB_FACTOR)
			this._storageField.setValue(lang.get("amountUsedOf_label", {
				"{amount}": usedStorageFormatted,
				"{totalAmount}": totalStorageFormatted
			}))
		})
	}

	_updateAliasField(customer: Customer, customerInfo: CustomerInfo): Promise<void> {
		const totalAmount = getTotalAliases(customer, customerInfo, this._lastBooking)
		if (totalAmount === 0) {
			this._emailAliasField.setValue("0")
			return Promise.resolve()
		} else {
			return serviceRequest(SysService.MailAddressAliasService, HttpMethod.GET, null, MailAddressAliasServiceReturnTypeRef)
				.then(aliasServiceReturn => {
					this._emailAliasField.setValue(lang.get("amountUsedAndActivatedOf_label", {
						"{used}": aliasServiceReturn.usedAliases,
						"{active}": aliasServiceReturn.enabledAliases,
						"{totalAmount}": totalAmount
					}))
				})
				.return()
		}
	}

	_updateGroupsField(): Promise<void> {
		let localAdminCount = getCurrentCount(BookingItemFeatureType.LocalAdminGroup, this._lastBooking)
		const localAdminText = localAdminCount + " " + lang.get((localAdminCount == 1) ? "localAdminGroup_label" : "localAdminGroups_label")
		let sharedMailCount = getCurrentCount(BookingItemFeatureType.SharedMailGroup, this._lastBooking)
		const sharedMailText = sharedMailCount + " " + lang.get((sharedMailCount == 1) ? "sharedMailbox_label" : "sharedMailboxes_label")
		if (localAdminCount === 0) { // also show the shared mailboxes text if no groups exists at all
			this._groupsField.setValue(sharedMailText)
		} else if (localAdminCount > 0 && sharedMailCount > 0) {
			this._groupsField.setValue(sharedMailText + ", " + localAdminText)
		} else {
			this._groupsField.setValue(localAdminText)
		}
		return Promise.resolve()
	}

	_updateContactFormsField(): Promise<void> {
		const totalAmount = getCurrentCount(BookingItemFeatureType.ContactForm, this._lastBooking)
		this._contactFormsField.setValue(totalAmount.toString())
		return Promise.resolve()
	}

	_updateWhitelabelField(): Promise<void> {
		if (isWhitelabelActive(this._lastBooking)) {
			this._whitelabelField.setValue(lang.get("active_label"))
		} else {
			this._whitelabelField.setValue(lang.get("deactivated_label"))
		}
		return Promise.resolve()
	}

	entityEventsReceived(updates: $ReadOnlyArray<EntityUpdateData>) {
		for (let update of updates) {
			this.processUpdate(update)
		}
	}

	processUpdate(update: EntityUpdateData): void {
		const {instanceId} = update
		if (isUpdateForTypeRef(AccountingInfoTypeRef, update)) {
			load(AccountingInfoTypeRef, instanceId).then(accountingInfo => this._updateAccountInfoData(accountingInfo))
			this._updatePriceInfo()
		} else if (isUpdateForTypeRef(UserTypeRef, update)) {
			this._updateBookings()
			this._updatePriceInfo()
		} else if (isUpdateForTypeRef(BookingTypeRef, update)) {
			this._updateBookings()
			this._updatePriceInfo()
		} else if (isUpdateForTypeRef(CustomerTypeRef, update)) {
			load(CustomerTypeRef, instanceId).then(customer => this._updateOrderProcessingAgreement(customer))
		}
	}
}

function _getAccountTypeName(type: AccountTypeEnum, isPro: boolean): string {
	if (type === AccountType.PREMIUM && isPro) {
		return "Pro"
	} else {
		return AccountTypeNames[Number(type)];
	}
}

export function changeSubscriptionInterval(accountingInfo: AccountingInfo, paymentInterval: number): void {
	if (accountingInfo && accountingInfo.invoiceCountry && Number(accountingInfo.paymentInterval) !== paymentInterval) {
		const invoiceCountry = neverNull(getByAbbreviation(neverNull(accountingInfo.invoiceCountry)))
		worker.updatePaymentData(accountingInfo.business, paymentInterval, {
				invoiceAddress: formatNameAndAddress(accountingInfo.invoiceName, accountingInfo.invoiceAddress),
				country: invoiceCountry,
				vatNumber: accountingInfo.invoiceVatIdNo
			},
			null,
			invoiceCountry)
	}
}
