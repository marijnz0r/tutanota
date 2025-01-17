//@flow
import {getInboxFolder} from "../mail/MailUtils"
import m from "mithril"
import {mailModel} from "../mail/MailModel"
import {assertMainOrNode} from "../api/Env"
import {LoginView} from "../login/LoginView"
import {ColumnType} from "../gui/base/ViewColumn"
import {header} from "../gui/base/Header";
import {modal} from "../gui/base/Modal";
import {last} from "../api/common/utils/ArrayUtils";

assertMainOrNode()

/**
 * Handles press of the android back button. Returns true if the action has been processed by the application.
 * False if the caller must handle the button press (quit the application)
 */
export function handleBackPress(): boolean {
	const lastModalComponent = last(modal.components)
	if (lastModalComponent) { // first check if any modal dialog is visible
		lastModalComponent.component.onClose()
		return true
	} else if (tutao.currentView instanceof LoginView && tutao.currentView.onBackPress()) {
		return true
	} else { // otherwise try to navigate back in the current view
		const viewSlider = header._getViewSlider()
		const currentRoute = m.route.get()
		// If the sidebar is opened, close it
		if (viewSlider && viewSlider.isForegroundColumnFocused()) {
			viewSlider.focusNextColumn()
			return true
		} else if (window.tutao.currentView && window.tutao.currentView.handleBackButton && window.tutao.currentView.handleBackButton()) {
			return true
		} else if (currentRoute.startsWith("/contact") || currentRoute.startsWith("/settings")
			|| currentRoute.startsWith("/search") || currentRoute.startsWith("/calendar")) { // go back to mail from other paths
			m.route.set(header.mailsUrl)
			return true
		} else if (viewSlider && viewSlider.isFirstBackgroundColumnFocused()) {
			// If the first background column is visible, quit
			return false
		} else if (viewSlider && viewSlider.isFocusPreviousPossible()) { // current view can navigate back
			viewSlider.focusPreviousColumn()
			return true
		} else if (m.route.get().startsWith("/mail/")) {
			const parts = m.route.get().split("/").filter(part => part !== "")
			if (parts.length > 1) {
				const selectedMailListId = parts[1]
				const inboxMailListId = getInboxFolder(mailModel.mailboxDetails()[0].folders).mails
				if (inboxMailListId !== selectedMailListId) {
					m.route.set("/mail/" + inboxMailListId)
					return true
				}
			}
			return false
		} else {
			return false
		}
	}
}

