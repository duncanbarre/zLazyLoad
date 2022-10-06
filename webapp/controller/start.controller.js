var mainController;

sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./../libs/moment",
	"sap/ui/model/json/JSONModel",
], function (Controller, momentjs, JSONModel) {
	"use strict";

	return Controller.extend("lazyload.zLazyLoad.controller.start", {
		onInit: function () {
			mainController = this;

			this.setScreenModel();
			this.observeColumns();
			this.createYearTable();
		},

		observeColumns: function () {
			this.observer = new IntersectionObserver(entries => {

				entries.forEach(entry => {
					const intersecting = entry.isIntersecting;

					if (intersecting) {
						for (let i = 1; i < 13; i++) {
							let month = `month${i}`;

							if (mainController.getView().getModel("screenModel").getData()[month] === false) {
								mainController.getView().getModel("screenModel").getData()[month] = true;
								mainController.getView().getModel("screenModel").refresh();

								mainController.observer.unobserve(entry.target);
								break;
							}
						}
					}
				});
			});
		},

		createYearTable: function () {
			this.oTableYear = this.getView().byId("scheduleTableYear");

			this.oTableYear.addEventDelegate({
				onAfterRendering: function () {

					if (mainController.oTableYear.getRows().length === 0) {
						return;
					}

					if (mainController.oTableYear.getRows()[0].getCells().length !== 0) {
						const rowLength = mainController.oTableYear.getRows()[0].getCells().length - 1;
						mainController.observer.observe(mainController.oTableYear.getRows()[0].getCells()[rowLength].getDomRef());
					}

				}
			});

			/**********************
			 *  1. add team /name  *
			 **********************/
			this.oTableYear.addColumn(new sap.ui.table.Column({
				label: "Team",
				template: new sap.m.Text({
					text: "{YearModel>TEAM}"
				})
			}));

			this.oTableYear.addColumn(new sap.ui.table.Column({
				label: "Naam",
				template: new sap.m.Text({
					text: "{YearModel>NAME}"
				})
			}));

			/*****************
			 *  2. add days  *
			 ****************/
			const dateCurrentYear = new Date(2022, 0, 1);
			const dateNextYear = new Date(2022 + 1, 0, 1);

			do {
				const month = moment(dateCurrentYear).locale('nl').format('MMMM').toUpperCase();
				const fieldDay = `{YearModel>${month}/DAY${dateCurrentYear.getDate()}}`;

				const newInput = new sap.m.Input({
					value: fieldDay
				}).addStyleClass("select--scheduletype");

				let columnVisible = `month${dateCurrentYear.getMonth() + 1}`;

				this.oTableYear.addColumn(new sap.ui.table.Column({
					visible: "{screenModel>/" + columnVisible + "}",
					width: "110px",
					headerSpan: mainController.getHeaderSpan(dateCurrentYear),
					multiLabels: [
						new sap.m.Label({
							text: moment(dateCurrentYear).locale('nl').format('MMM D')
						}),
						new sap.m.Label({
							text: moment(dateCurrentYear).locale('nl').format('dd')
						}),
						new sap.m.Label({
							text: `week ${moment(dateCurrentYear).locale('nl').isoWeek()}`
						})
					],
					template: newInput

				}));

				dateCurrentYear.setDate(dateCurrentYear.getDate() + 1);

			} while (dateCurrentYear.getFullYear() < dateNextYear.getFullYear());
		},

		getHeaderSpan: function (oDay) {
			let headerSpan = [0, 0, 7];
			let count = 1;
			const countDate = new Date(oDay);

			if (oDay.getMonth() === 0 && oDay.getDate() <= 7 && moment(oDay).locale("nl").isoWeek() !== 1) {
				do {
					countDate.setDate(countDate.getDate() + 1);

					if (moment(oDay).locale("nl").isoWeek() === moment(countDate).locale("nl").isoWeek()) {
						count++;
					}
				} while (moment(oDay).locale("nl").isoWeek() === moment(countDate).locale("nl").isoWeek());

				headerSpan = [0, 0, count];
			}

			return headerSpan;
		},

		setScreenModel: function () {
			const screenData = {
				"month1": true,
				"month2": false,
				"month3": false,
				"month4": false,
				"month5": false,
				"month6": false,
				"month7": false,
				"month8": false,
				"month9": false,
				"month10": false,
				"month11": false,
				"month12": false
			};
			const screenModel = new JSONModel(screenData);
			this.getView().setModel(screenModel, "screenModel");
		},

	});
});