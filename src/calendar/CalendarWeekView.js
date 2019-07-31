// @flow

import m from "mithril"
import type {GestureInfo} from "../gui/base/ViewSlider"
import {gestureInfoFromTouch} from "../gui/base/ViewSlider"
import {getDayShifted, getStartOfDay} from "../api/common/utils/DateUtils"
import {styles} from "../gui/styles"
import {dateWithWeekdayWoMonth, formatMonthWithFullYear, formatTime} from "../misc/Formatter"
import {eventEndsAfterDay, eventStartsBefore, getCalendarWeek, getDiffInDays, getEventColor, layOutEvents} from "./CalendarUtils"
import {CalendarDayEventsView, calendarDayTimes} from "./CalendarDayEventsView"
import {neverNull} from "../api/common/utils/Utils"
import {getFromMap} from "../api/common/utils/MapUtils"
import {getEventEnd, getEventStart, isAllDayEvent} from "../api/common/utils/CommonCalendarUtils"
import {theme} from "../gui/theme"
import {px, size} from "../gui/size"
import {ContinuingCalendarEventBubble} from "./ContinuingCalendarEventBubble"
import type {WeekStartEnum} from "../api/common/TutanotaConstants"
import {EventTextTimeOption} from "../api/common/TutanotaConstants"
import {lastThrow} from "../api/common/utils/ArrayUtils"
import {Icon} from "../gui/base/Icon"
import {Icons} from "../gui/base/icons/Icons"

export type Attrs = {
	selectedDate: Date,
	eventsForDays: Map<number, Array<CalendarEvent>>,
	onNewEvent: (date: ?Date) => mixed,
	onEventClicked: (event: CalendarEvent) => mixed,
	groupColors: {[Id]: string},
	hiddenCalendars: Set<Id>,
	startOfTheWeek: WeekStartEnum,
	onChangeWeek: (next: bool) => mixed,
}

export class CalendarWeekView implements MComponent<Attrs> {
	_redrawIntervalId: ?IntervalID;
	_lastGestureInfo: ?GestureInfo;
	_oldGestureInfo: ?GestureInfo;
	_longEventsDom: ?HTMLElement;

	view(vnode: Vnode<Attrs>) {
		const todayTimestamp = getStartOfDay(new Date()).getTime()
		const date = vnode.attrs.selectedDate
		const week = getCalendarWeek(vnode.attrs.selectedDate, vnode.attrs.startOfTheWeek)

		const eventsForWeek = new Set()
		const eventsPerDay = []
		week.forEach((wd) => {
			const weekdayDate = new Date(wd)
			const eventsForWeekDay = []
			getFromMap(vnode.attrs.eventsForDays, wd, () => [])
				.forEach((event) => {
					if (!vnode.attrs.hiddenCalendars.has(neverNull(event._ownerGroup)) && !eventsForWeek.has(event)) {
						const isShort = !isAllDayEvent(event)
							&& !eventStartsBefore(weekdayDate, event)
							&& !eventEndsAfterDay(weekdayDate, event)
						if (isShort) {
							eventsForWeekDay.push(event)
						} else {
							eventsForWeek.add(event)
						}
					}
				})
			eventsPerDay.push(eventsForWeekDay)
		})

		return m(".fill-absolute.flex.col", {
			oncreate: () => {
				this._redrawIntervalId = setInterval(m.redraw, 1000 * 60)
			},
			onremove: () => {
				if (this._redrawIntervalId != null) {
					clearInterval(this._redrawIntervalId)
					this._redrawIntervalId = null
				}
			},
			ontouchstart: (event) => {
				this._lastGestureInfo = this._oldGestureInfo = gestureInfoFromTouch(event.touches[0])
			},
			ontouchmove: (event) => {
				this._oldGestureInfo = this._lastGestureInfo
				this._lastGestureInfo = gestureInfoFromTouch(event.touches[0])
			},
			ontouchend: () => {
				const lastGestureInfo = this._lastGestureInfo
				const oldGestureInfo = this._oldGestureInfo
				if (lastGestureInfo && oldGestureInfo) {
					const velocity = (lastGestureInfo.x - oldGestureInfo.x) / (lastGestureInfo.time - oldGestureInfo.time)
					const verticalVelocity = (lastGestureInfo.y - oldGestureInfo.y) / (lastGestureInfo.time - oldGestureInfo.time)
					const absVerticalVelocity = Math.abs(verticalVelocity)
					if (absVerticalVelocity > Math.abs(velocity) || absVerticalVelocity > 0.8) {
						// Do nothing, vertical scroll
					} else if (velocity > 0.6) {
						vnode.attrs.onChangeWeek(false)
					} else if (velocity < -0.6) {
						vnode.attrs.onChangeWeek(true)
					}
				}
			},
		}, [
			m(".mt-s", [
				styles.isDesktopLayout()
					? m(".pr-l.flex.row.items-center",
					[
						m("button.ml-s.calendar-day-content", {
							onclick: () => vnode.attrs.onChangeWeek(false)
						}, m(Icon, {icon: Icons.ArrowBackward, class: "icon-large switch-month-button"})),
						m("button", {
							onclick: () => vnode.attrs.onChangeWeek(true)
						}, m(Icon, {icon: Icons.ArrowForward, class: "icon-large switch-month-button"})),
						m("h1.ml-m", formatMonthWithFullYear(vnode.attrs.selectedDate)),
					])
					: null,
				m(".flex", {
					style: {
						"margin-left": px(size.calendar_hour_width),
					}
				}, week.map((wd) => m(".flex-grow.center" + (todayTimestamp === wd ? ".b" : ""), dateWithWeekdayWoMonth(new Date(wd))))),
				m(".calendar-day-content.flex.row",
					{
						oncreate: (vnode) => {
							this._longEventsDom = vnode.dom
							m.redraw()
						}
					},
					this._renderLongEvents(week, eventsForWeek, vnode)),
				m("hr.hr.mt-s")
			]),
			m(".flex.scroll", {
				oncreate: (vnode) => {
					vnode.dom.scrollTop = size.calendar_hour_height * 6
				}
			}, [
				m(".flex.col", calendarDayTimes.map(n => m(".calendar-hour.flex", {
						style: {
							'border-bottom': `1px solid ${theme.content_border}`,
							height: px(size.calendar_hour_height)
						},
						onclick: (e) => {
							e.stopPropagation()
							// vnode.attrs.onTimePressed(n.getHours(), n.getMinutes())
						},
					},
					m(".pt.pl-s.pr-s.center.small", {
						style: {
							width: px(size.calendar_hour_width),
							height: px(size.calendar_hour_height),
							'border-right': `2px solid ${theme.content_border}`,
						},
					}, formatTime(n))
					)
				)),
				m(".flex.flex-grow", week.map((weekdayTimestamp, i) => {
						const events = eventsPerDay[i]
						return m(".flex-grow", {
							style: {
								"border": `1px solid ${theme.list_border}`,
								height: px(calendarDayTimes.length * size.calendar_hour_height)
							}
						}, m(CalendarDayEventsView, {
							onEventClicked: vnode.attrs.onEventClicked,
							groupColors: vnode.attrs.groupColors,
							events: events,
							displayTimeIndicator: weekdayTimestamp === todayTimestamp,
							onTimePressed: (hours, minutes) => {
								const eventDate = new Date(weekdayTimestamp)
								eventDate.setHours(hours, minutes)
								vnode.attrs.onNewEvent(eventDate)
							}
						}))
					})
				)
			]),
		])

	}

	_renderLongEvents(week: Array<number>, eventsForWeek: Set<CalendarEvent>, vnode: Vnode<Attrs>) {
		if (this._longEventsDom == null) {
			return null
		}
		const dayWidth = this._longEventsDom.offsetWidth / 7
		let maxColumns = 0
		const firstDayOfWeek = new Date(week[0])
		const lastDayOfWeek = new Date(lastThrow(week))
		const calendarEventMargin = styles.isDesktopLayout() ? size.calendar_event_margin : size.calendar_event_margin_mobile

		const children = layOutEvents(Array.from(eventsForWeek), (columns) => {
			maxColumns = Math.max(maxColumns, columns.length)
			return columns.map((rows, c) =>
				rows.map((event) => {
					const eventEnd = isAllDayEvent(event) ? getDayShifted(getEventEnd(event), -1) : event.endTime
					const dayOfStartDateInWeek = getDiffInDays(getEventStart(event), firstDayOfWeek)
					const dayOfEndDateInWeek = getDiffInDays(eventEnd, firstDayOfWeek)
					const left = eventStartsBefore(firstDayOfWeek, event) ? 0 : dayOfStartDateInWeek * dayWidth
					const right = (eventEndsAfterDay(lastDayOfWeek, event) ? 0 : (6 - dayOfEndDateInWeek) * dayWidth) + calendarEventMargin
					return m(".abs", {
						style: {
							top: px(c * 20),
							left: px(left),
							right: px(right),
						}
					}, m(ContinuingCalendarEventBubble, {
						event,
						startDate: firstDayOfWeek,
						endDate: lastDayOfWeek,
						color: getEventColor(event, vnode.attrs.groupColors),
						onEventClicked: vnode.attrs.onEventClicked,
						showTime: isAllDayEvent(event) ? EventTextTimeOption.NO_TIME : EventTextTimeOption.START_TIME,
					}))
				}))
		}, true)

		return m(".rel",
			{style: {height: px(maxColumns * 20), width: "100%"}},
			children
		)
	}
}
