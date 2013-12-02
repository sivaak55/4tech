// Timeout defined for canp ajax activity
var CanpAjaxTO = 15000;
var CanpCommEMsg = 'Data not available at this time. Please try again later';       // communication or msg.d error
var CanpGenEMsg = 'Error detected. Please contact your BGE service representative.'; // generic server error
var globalEMsg = ''; //to store the global error message
var summaryWaitCount = 0;
var outageWaitCount = 0;
var ReportOutageWaitCount = 0;
$(document).ready(function () {

    GetMessages();
    ToolTips();
    TestHtmlResMgr();

    //initilize CSS
   /* if ($("#cssInitURL").length > 0) {
        $('<iframe />', {
            name: 'cssInitFame',
            id: 'cssInitFame',
            width: 0,
            height: 0,
            src: $("#cssInitURL").text()
        }).appendTo('#uiAccPre');
    }*/
    if ($("#uiPnlAcctSum").length > 0) {
        GetAccountSummary();
        //Add subnav bar
        $("header").after('<div class="subNavWrapper"> <ul class="iwtabsSubNav"><li class="active"><span>Overview</span></li><li><a style="color:white"  href="/myaccount/CSS/Pages/adaptor.aspx?pgcode=17" >Service Changes</a></li></ul></div>');
    }
    else {
        //blank subnav bar for savings tips page etc..
        $("header").after('<div class="subNavWrapper"> <ul class="iwtabsSubNav"><li><span style="height:12px"></span></li></ul></div>');
    }

    /*if ($("#uiPnlBillSum").length > 0) {
    GetBillSummary();
    }
    if ($("#uiAccPre").length > 0) {
    summaryWaitCount++;
    GetAccountPreferences();
    }
    if ($("#uiPnlHoodComp").length > 0) {
    GetHoodComparison();
    }
    */
    /*  Moving these 2 calls under Get account summary
    // if ($("#uiPnlOpowerComp").length > 0) {
    
    if (amiFlag == true && commFlag == false) {
    amiWaitCount++;
    GetOpowerComp();
    }
    else {
    $('#neighbourhoodCompareTab').hide();
    $('#neighbourhoodCompareBody').removeClass('active');
    $('#billCompareTab').hide();
    $('#billCompareBody').removeClass('active');
    }

    if (serFlag == "ENROLLED") {
    amiWaitCount++;
    showSERHistoricalData();
    }
    */

    if ($("#uiExemptionNotice").length > 0) {
        summaryWaitCount++;
        GetDisconnect();
    }

    if ($("#uiPnlProgram").length > 0) {
        outageWaitCount++;
        GetPrograms();
    }

    if ($("#uiPnlOutage").length > 0) {
        outageWaitCount++;
        GetOutages();
    }
    /*if ($("#uiPnlOpowerComp").length > 0) {
        GetOpowerComp();
    }

    if ($("#uiExemptionNotice").length > 0) {
        summaryWaitCount++;
        GetDisconnect();
    }*/
    if ($("#uiSERPRAlert").length > 0) {
        summaryWaitCount++;
        ShowAlertMessage();
    }
    if ($(".OutageDisp").length > 0) {
        //Add subnav bar
        $(".subNavWrapper").html('<ul class="iwtabsSubNav"><li class="active"><span>Report An Outage</span></li></ul>');
    }
    if ($(".NoOutage").length > 0 && $("#uiPnlAcctSum").length == 0) {
        //Add subnav bar
        $(".subNavWrapper").html('<ul class="iwtabsSubNav"><li class="active"><span>Report An Outage</span></li></ul>');
    }
    $("#expanderHead").click(function () {
        $("#savings-day-historical").slideToggle();
        if ($("#expanderSign").text() == "+") {
            $("#expanderSign").html("−")
        }
        else {
            $("#expanderSign").text("+")
        }
    });

});

function ToolTips() {
    $('#uiWhatHoodPrompt').hover(function () {
        var pos = $(this).position();
        var width = $(this).outerWidth();
        $("#divDescription").width("200px");
        var height = ($("#uiWhatHoodBox").outerHeight() / 2) + 10;
        $("#uiWhatHoodBox").css({
            position: "absolute",
            top: (pos.top - height) + "px",
            left: (pos.left + width + 8) + "px"
        }).show();
    },
		function () {
		    $('#uiWhatHoodBox').hide();
		});


    $('#uiWhatBillPrompt').hover(function () {
        var pos = $(this).position();
        var width = $(this).outerWidth();
        $("#divDescription").width("200px");
        var height = ($("#uiWhatBillBox").outerHeight() / 2) + 18;
        $("#uiWhatBillBox").css({
            position: "absolute",
            top: (pos.top - height) + "px",
            left: (pos.left + width + 8) + "px"
        }).show();
    },
		function () {
		    $('#uiWhatBillBox').hide();
		});

    $('#uiWhatHoodBox').hide();
    $('#uiWhatBillBox').hide();
}

// Read Messages.xml file into local variable
var CANPMessages;
function GetMessages() {
    $.ajax({
        type: "POST",
        async: true,
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetMessages",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: SaveCANPMessages
    });
}

function SaveCANPMessages(msg) {
    if (!jQuery.isEmptyObject(msg.d) && !jQuery.isEmptyObject(msg.d.messageData) && !jQuery.isEmptyObject(msg.d.messageData.Messagelist)) {
        CANPMessages = msg.d.messageData.Messagelist
    }
}


function findMessage(id) {
    if (!jQuery.isEmptyObject(CANPMessages)) {
        for (var message in CANPMessages) {
            if (CANPMessages[message].id === id) {
                return CANPMessages[message].content;
            }
        }
        return "System Error";
    }
    else {
        return "System Error";
    }
}


// HTML Resource Manager test 
function TestHtmlResMgr() {
    $(".TestBoxJs").css("background-color", "green");
}




//Account Summary functions --
function GetAccountSummary() {
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetAccountSummary",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: AcctSumPopulate,
        error: AcctSumError,
        complete: AcctSumComplete
    });
}
function AcctSumPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(msg.d.ErrorMessage);
        return;
    }
    //Bill Summary

    $('#uiAmount').text(msg.d.LastPayment);
    $('#uiReceived').text(msg.d.Received);
    $('#uiDue').text(msg.d.NetAmountDue);
    $('#uiDueDate').text(msg.d.DueDate);

    //Account Preferences
    if (msg.d.AccountPreferencesList != null && msg.d.AccountPreferencesList.length > 0) {
        $('#uiPre').empty();
        $.each(msg.d.AccountPreferencesList, function (idx) {
            $('#uiPre').append('<li><a href=' + this.Url + '>' + this.Name + '</a></li>');
        });

    }

    //Account Summary
    $('#uiAccountId').text(msg.d.AccountId);
    $('#uiAccountHolderName').text(msg.d.PrimaryAccountHoldersName);
    $('#uiAddress').text(msg.d.MailAddress);
    if (msg.d.MailAddress != null && msg.d.MailAddress.length > 0) {
        $('#uiAddress').empty();
        $.each(msg.d.MailAddress, function (idx) {
            $('#uiAddress').append('<li>' + this + '</li>');
        });
    }
    if (msg.d.NumberAccounts > 1) {
        $('#uiAccountSelection').show();
    }
    if (msg.d.ServiceList != null && msg.d.ServiceList.length == 1 && msg.d.ServiceList[0].Address != "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiNoPremise').hide();
        $('#uiPremiseSingle').text(msg.d.ServiceList[0].Address);
    }
    else if (msg.d.ServiceList != null && msg.d.ServiceList.length > 1) {
        $('#uiPremiseSingle').hide();
        $('#uiPremise').show();
        $('#uiNoPremise').hide();
        var pselect = $('#uiPremiseSelect');
        pselect.empty();
        $.each(msg.d.ServiceList, function (idx) {
            pselect.append('<option value=' + this.Id + '>' + this.Address + '</option>');
        });
        pselect.change(OnChangePremise);
    }
    else if (msg.d.ServiceList[0].Address == "No Data") {
        $('#uiPremiseSingle').show();
        $('#uiPremise').hide();
        $('#uiPremiseSingle').text('no premise');
        $('#uiNoPremise').show();
    }

    //Moving the calls to Account Summary
    $('#neighbourhoodCompareTab').addClass('active');
    $('#neighbourhoodCompareBody').addClass('active');
    if (msg.d.IsAMI == true && msg.d.IsCommercial == false) {
        amiWaitCount++;
        GetOpowerComp();
    } else {
        $('#neighbourhoodCompareTab').hide();
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#billCompareTab').hide();
        $('#billCompareBody').removeClass('active');
    }

    if (msg.d.IsSER == "ENROLLED") {
        amiWaitCount++;
        showSERHistoricalData();
    } else {
        $('#SERHistoricalData').removeClass('active');
        $('#SERHistoricalDataTab').hide();
    }


}
function AcctSumError(xhr, ajaxOptions, thrownError) {
    // take away wait symbol and display error message
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum > div").removeClass("greyout");
}
function AcctSumComplete(xhr, status) {
    // take away wait symbol and display error message if any
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum > div").removeClass("greyout");
    if (status == 'timeout') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
    }
    else if (status != 'success') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(CanpGenEMsg);
    }
}


// Opower Comparison functions --
var hbar1 = 0;
var hbar2 = 0;
var hbar3 = 0;
var hbar4 = 0;
var elecCompData;
var gasCompData;
var hoodCompData;
var oPowerErrorMessage;
var mErrorMessage;
function GetOpowerComp() {
    $('#uiOpowerError').removeClass('active');
    $("#uiWaitHoodComp").show();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetOpowerData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: OpowerCompPopulate,
        error: OpowerCompError,
        complete: OpowerCompComplete
    });
}

function OpowerCompPopulate(msg) {
    mErrorMessage = null;
    if (jQuery.isEmptyObject(msg.d)) {
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#billCompareBody').removeClass('active');
        $('#uiOpowerError').addClass('active');
        $("#uiOpowerErrorTxt").html(findMessage('OPOWER_ERROR')); // Data Error
        mErrorMessage = "Error";
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#billCompareBody').removeClass('active');
        $('#uiOpowerError').addClass('active');
        $("#uiOpowerErrorTxt").html(findMessage('OPOWER_ERROR')); // Data Error
        mErrorMessage = msg.d.ErrorMessage;
        return;
    }
    elecCompData = msg.d.BillComparisonElec;
    gasCompData = msg.d.BillComparisonGas;
    hoodCompData = msg.d.HoodComparison;
    oPowerErrorMessage = msg.d.oPowerMessage;
}
function OpowerCompError(xhr, ajaxOptions, thrownError) {
    // take away wait symbol and display error message
    $("#uiWaitHoodComp").hide();
    $('#neighbourhoodCompareBody').removeClass('active');
    $('#billCompareBody').removeClass('active');
    $('#uiOpowerError').addClass('active');
    $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error
}
function OpowerCompComplete(xhr, status) {
    amiWaitCount--;
    checkAndHideWaiting();
    $("#uiWaitHoodComp").hide();
    if (status == 'timeout') {
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#billCompareBody').removeClass('active');
        $('#uiOpowerError').addClass('active');
    }
    else if (jQuery.isEmptyObject(mErrorMessage)) {
        showHoodComparison();
    }
}
function daysBetween(first, second) {
    // Copy date parts of the timestamps, discarding the time parts. Month is 0 based
    var one = new Date(first.getFullYear(), first.getMonth() - 1, first.getDate());
    var two = new Date(second.getFullYear(), second.getMonth() - 1, second.getDate());
    // Do the math.
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var millisBetween = two.getTime() - one.getTime();
    var days = millisBetween / millisecondsPerDay;
    // Round down.
    return Math.floor(days) + 1;
}
function showHoodComparison(obj) {

//    if (!jQuery.isEmptyObject(mErrorMessage))
//        return;

    $('#SERHistoricalData').removeClass('active');
    $('#SERHistoricalDataTab').removeClass('active');
    //hide error
    $('#uiOpowerError').removeClass('active');
    $('#billCompareTab').removeClass('active');
    $('#billCompareBody').removeClass('active');
    $('#neighbourhoodCompareTab').addClass('active');
    $('#neighbourhoodCompareBody').addClass('active');
    if (!jQuery.isEmptyObject(mErrorMessage)) {
        $('#uiOpowerError').addClass('active');
        $('#neighbourhoodCompareBody').removeClass('active');
        return;
    }
    if (!jQuery.isEmptyObject(hoodCompData))
        fillHoodComp();
    else {
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#uiOpowerError').addClass('active');
        $('opowerIcon').show();
        $('#uiOpowerErrorTxt').html(findMessage('OPOWER_ERROR')); // Data Error
    }
}


function sortBars() {
    var items = $('.horizontalBarGraph').find('li');
    items.sort(function (a, b) {
        return (($(a).children("span").attr("barLength")) - ($(b).children("span").attr("barLength")))
    });
    $('.horizontalBarGraph').empty().html(items);
}

function fillHoodComp() {
    var commodity = hoodCompData.Combined;
    var commodityUnitsType = 'units';
    if (jQuery.isEmptyObject(commodity)) {
        commodity = hoodCompData.Elec;
        commodityUnitsType = 'kWh';
        if (jQuery.isEmptyObject(commodity)) {
            commodity = hoodCompData.Gas;
            commodityUnitsType = 'therms';
        }
    }
    if (jQuery.isEmptyObject(commodity)) {
        $('.horizontalGraphArea').hide();
        //To-Do Show NoData
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#uiOpowerError').addClass('active');
        $('opowerIcon').show();
        $('#uiOpowerErrorTxt').html(findMessage('OPOWER_ERROR')); // Data Error
    } else {

        var maxUsage = Math.max(commodity.EfficientNeighbors, commodity.Neighbors, commodity.You);

        //Bars
        var efficientNeighborsLength = (commodity.EfficientNeighbors / maxUsage) * 300;
        if (efficientNeighborsLength < 50) efficientNeighborsLength = 50;
        var neighborsLength = (commodity.Neighbors / maxUsage) * 300;
        if (neighborsLength < 50) neighborsLength = 50;
        var youLength = (commodity.You / maxUsage) * 300;
        if (youLength < 50) youLength = 50;

        $('#uiEfficientNeighbors').attr("barLength", efficientNeighborsLength);
        $('#uiAllNeighbors').attr("barLength", neighborsLength);
        $('#uiYourHouseHold').attr("barLength", youLength);

        sortBars();
        $('.horizontalGraphArea').show();
        $('#uiEfficientNeighbors').width(10);
        $('#uiAllNeighbors').width(10);
        $('#uiYourHouseHold').width(10);
        $('#uiEfficientNeighbors').animate({ width: efficientNeighborsLength, avoidTransforms: true }, 1500, function () { });
        $('#uiAllNeighbors').animate({ width: neighborsLength, avoidTransforms: true }, 1500, function () { });
        $('#uiYourHouseHold').animate({ width: youLength, avoidTransforms: true }, 1500, function () { });
        $('#uiEfficientNeighbors').text(Math.round(commodity.EfficientNeighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        $('#uiAllNeighbors').text(Math.round(commodity.Neighbors) + ' ' + commodityUnitsType); //added to show the values inside the wood bars
        $('#uiYourHouseHold').text(Math.round(commodity.You) + ' ' + commodityUnitsType); //added to show the values inside the wood bars

        //Percentage Calculation
        var effiencyPct = 0;
        var moreLess = "MORE";
        var compareWith = "similar";

        if (commodity.You > commodity.Neighbors) {
            effiencyPct = (commodity.You - commodity.Neighbors) / commodity.Neighbors * 100;
        }
        else if (commodity.You > commodity.EfficientNeighbors) {
            compareWith = "efficient";
            effiencyPct = (commodity.You - commodity.EfficientNeighbors) / commodity.EfficientNeighbors * 100;
        }
        else {
            compareWith = "efficient";
            effiencyPct = (commodity.EfficientNeighbors - commodity.You) / commodity.EfficientNeighbors * 100;
            moreLess = "LESS";
        }

        $('#uiEffiency').text(Math.round(effiencyPct) + '% ' + moreLess);

        $('#uiComparewith').text(compareWith);
        var startDate = new Date(parseInt(commodity.StartDate.substr(6, 13)));
        var endDate = new Date(parseInt(commodity.EndDate.substr(6, 13)));
        $('#uiHoodDateRange').text(startDate.format("MMMM d") + " - " + endDate.format("MMMM d yyyy"));
    }
}


function showBillComparison() {

    //hide error
    $('#uiOpowerError').removeClass('active');
    $('#neighbourhoodCompareTab').removeClass('active');
    $('#neighbourhoodCompareBody').removeClass('active');
    $('#billCompareTab').addClass('active');
    $('#billCompareBody').addClass('active');
    $('#SERHistoricalData').removeClass('active');
    $('#SERHistoricalDataTab').removeClass('active');
    if (!jQuery.isEmptyObject(mErrorMessage)) {
        $('#uiOpowerError').addClass('active');
        $('#billCompareBody').removeClass('active');
        return;
    }
    if (!jQuery.isEmptyObject(gasCompData) && !jQuery.isEmptyObject(elecCompData)) {
        $('#utilityTypeText').hide();
        $("#uiUtilityTypeSelect").show();
        if (!jQuery.isEmptyObject(gasCompData.FailureExplanation) || !jQuery.isEmptyObject(elecCompData.FailureExplanation)) {
            $('#uiOpowerError').addClass('active');
            $('#billCompareBody').removeClass('active');
            $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error
            return;
        }
    } else if (!jQuery.isEmptyObject(gasCompData)) {
        if (!jQuery.isEmptyObject(gasCompData.FailureExplanation)) {
            $('#uiOpowerError').addClass('active');
            $('#billCompareBody').removeClass('active');
            $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error
            return;
        }
        else {
            $('#utilityTypeText').show();
            $("#uiUtilityTypeSelect").hide();
            $("#utilityType").val("gas");
            $('#utilityTypeText').text('Compare my gas bill');
        }
    } else if (!jQuery.isEmptyObject(elecCompData)) {
        if (!jQuery.isEmptyObject(elecCompData.FailureExplanation)) {
            $('#uiOpowerError').addClass('active');
            $('#billCompareBody').removeClass('active');
            $('#uiOpowerErrorTxt').html(findMessage('OPOWER_PARTIAL_ERROR')); // Partial Data Error
            return;
        } else {
            $('#utilityTypeText').show();
            $("#uiUtilityTypeSelect").hide();
            $('#utilityTypeText').text('Compare my electricity bill');
        }

    } else {

        $('#uiOpowerError').addClass('active');
        $('#billCompareBody').removeClass('active');
        $('opowerIcon').show();
        $('#uiOpowerErrorTxt').html(findMessage('OPOWER_ERROR')); // Data Error
        return;
    }

    changeUtilityType();
}

function showGasComp() {
    showCompBars(gasCompData, "Therms");
}
function showElecComp() {
    showCompBars(elecCompData, "kWh");
}
function showCompBars(data, units) {

    $('.calloutLeftArrow').show();
    $('.verticalBarLandscape').show();

    if (data.Reference.AverageTemperature == 0 || data.Compared.AverageTemperature == 0) {
        data.Reference.AverageTemperature = 0;
        data.Compared.AverageTemperature = 0;
    }
    SetCompBar($('#uiRefCharges'), $('#uiRefDays'), $('#uiRefUsage'), $('#uiRefTemp'), $('#uiRefDateRangeE'), data.Reference, units)
    SetCompBar($('#uiCompCharges'), $('#uiCompDays'), $('#uiCompUsage'), $('#uiCompTemp'), $('#uiCompDateRangeE'), data.Compared, units)
    hbar1 = 80;
    hbar2 = 150;
    SetBarHeights(data.Reference.Charges, data.Compared.Charges);
    animateBars();
}
function SetCompBar(charges, days, usage, temp, dateRange, data, units) {
    //set charges to 2 decimal places
    charges.text('$' + data.Charges.toFixed(2));
    var startMilli = parseInt(data.StartDate.substr(6, 13));
    var endMilli = parseInt(data.EndDate.substr(6, 13));
    var startDate = new Date(startMilli);
    var endDate = new Date(endMilli);
    var millisecondsPerDay = 1000 * 60 * 60 * 24;
    var diffdays = Math.round((endMilli - startMilli) / millisecondsPerDay) + 1; // Include end date
    //var diffdays = daysBetween(startDate, endDate);
    days.text(diffdays + ' days');
    usage.text(data.Usage + ' ' + units);
    if (data.AverageTemperature != 0)
        temp.text('avg. temp ' + Math.round(data.AverageTemperature)); //rounded averate to 0 decimals
    else {
        temp.hide();
    }

    dateRange.text(startDate.format("MMM dd") + " - " + endDate.format("MMM dd, yyyy"));

    $('#uiBillCompRange').text(startDate.format("MMM dd, yyyy") + " - " + endDate.format("MMM dd, yyyy"));
}
function SetBarHeights(refData, CompData) {
    var diff = CompData - refData;
    var diffmargin = refData * 0.10;
    if (diff > 0) diffmargin = CompData * 0.10;

    if (diff > diffmargin) {
        $('#uiChargeDiff').text('$' + diff.toFixed(2) + " lower");
        $('#uiChargeCmp').text(' than');
        hbar1 = 300;
        var smallbar = (refData * 300 / CompData);
        if (smallbar < 80) smallbar = 80;
        hbar2 = smallbar;
    } else if (diff < -diffmargin) {
        diff = -diff;
        $('#uiChargeDiff').text('$' + diff.toFixed(2) + " higher");
        $('#uiChargeCmp').text(' than');
        hbar2 = 300;
        var smallbar = (CompData * 300 / refData);
        if (smallbar < 80) smallbar = 80;
        hbar1 = smallbar;
    } else {
        $('#uiChargeDiff').text(" about the same");
        $('#uiChargeCmp').text(' as');
        hbar2 = 300;
        var smallbar = (CompData * 300 / refData);
        if (smallbar < 80) smallbar = 80;
        hbar1 = smallbar;
        diff = Math.abs(diff);
    }
}
function changeUtilityType() {

    if ($("#utilityType").val() == "electricity" || $('#utilityTypeText').text() == "Compare my electricity bill") {
        showElecComp();
    } else {
        showGasComp();
    }
}
function animateBars() {
    if ($('#billComparisonElecBars').is(":visible")) {
        $('#elecbardata2').hide();
        $('#elecbardata1').hide();
        $('#elecbar1').height(10);
        $('#elecbar2').height(10);
        $('#elecbar1').animate({ height: hbar1, avoidTransforms: true }, 1500, function () { $('#elecbardata1').show() });
        $('#elecbar2').animate({ height: hbar2, avoidTransforms: true }, 1500, function () { $('#elecbardata2').show() });
    }

}



// Premise change functions -- 
function OnChangePremise() {

    OnChangePremiseAjax();
}
function OnChangePremiseAjax() {
    var jsonData = { "pId": $('#uiPremiseSelect').val() };
    var data = JSON.stringify(jsonData);
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/ChangePremise",
        data: data,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: PremiseChanged,
        error: PremiseError,
        complete: PremiseComplete
    });
}
function PremiseChanged(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(msg.d.ErrorMessage);
        return;
    }
    refreshData();

}

function PremiseError(xhr, ajaxOptions, thrownError) {
    // take away wait symbol and display error message
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum").removeClass("greyout");
}
function PremiseComplete(xhr, status) {
    // take away wait symbol and display error message if any
    $("#uiWaitAcctSum").hide();
    $("#uiPnlAcctSum").removeClass("greyout");
    if (status == 'timeout') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
    }
    else if (status != 'success') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text("Unable to change premise." + CanpGenEMsg);
    }
}

function refreshData() {

    if ($("#uiPnlProgram").length > 0) {
        $('#uiOutagesComboLoading').show();

        outageWaitCount++;
        GetPrograms();
    }
    if ($("#uiPnlOutage").length > 0) {
        outageWaitCount++;
        $('#uiOutagesComboLoading').show();
        GetOutages();
    }
    if ($("#uiSERPRAlert").length > 0) {
        summaryWaitCount++;
        ShowAlertMessage();
    }


    /*
    if ($("#uiPnlOpowerComp").length > 0) {
        $('#uiWaitHoodComp').show();
        GetOpowerComp();
        showSERHistoricalData();
    }
    */
    /*  Moving these 2 calls under Get account summary
    if (amiFlag == true && commFlag == false) {
        amiWaitCount++;
        GetOpowerComp();
    }
    else {
        $('#neighbourhoodCompareTab').hide();
        $('#neighbourhoodCompareBody').removeClass('active');
        $('#billCompareTab').hide();
        $('#billCompareBody').removeClass('active');
    }

    if (serFlag == "ENROLLED") {
        amiWaitCount++;
        showSERHistoricalData();
    }
    */



}

// Disconnect Notice functions ---
function GetDisconnect() {
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetDisconnect",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: DiscPopulate,
        error: DiscError,
        complete: DiscComplete
    });
}
function DiscPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(msg.d.ErrorMessage);
        return;
    }
    if (!jQuery.isEmptyObject(msg.d.DDate) && msg.d.DDate.length > 0) {
        $('#uiExemptionNotice').show();
    }
}
function DiscError(xhr, ajaxOptions, thrownError) {
    return;
}
function DiscComplete(xhr, status) {
    summaryWaitCount--;
    checkAndHideWaiting();
    if (status == 'timeout' || status != 'success') {
        $("#uiSessionStatusAcctSum").css("visibility", "visible");
        $("#uiSessionStatusAcctSum").text(CanpGenEMsg);
    }
}

//Report an Outage function ---
function ReportAnOutage() {
    $(".OutageDisp").css("visibility", "visible");
    $("#uiReportOutageLoading").show();
    $("#btnReportOutage").hide();
    $('#divETR').hide();
    $('#divStLightOutages').show();
    $('#divEmergencies').show();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/ReportAnOutageData",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: RportAnOutageSuccess,
        error: RportAnOutageError
    });
}

function RportAnOutageSuccess(msg) {

    $("#uiReportOutageLoading").hide();

    if (jQuery.isEmptyObject(msg.d)) {
        $(".NoOutage").show();
        $("#uiStatus").text("There was an error submitting your outage. Please call 877.778.2222 to report an outage.");
        $("#uiOutageHeader").text("<b>Error reporting your outage</b>");
        $(".OutageDisp").hide();
        return;
    } else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $(".NoOutage").show();
        $("#uiStatus").text(msg.d.ErrorMessage);
        $("#uiOutageHeader").text("<b>Error reporting your outage</b>");
        $(".OutageDisp").hide();
        return;
    }
    OutageReportUpdate(true, msg.d.ETRDescription);
}

function RportAnOutageError(xhr, ajaxOptions, thrownError) {
    $("#uiReportOutageLoading").hide();
    $(".OutageDisp").hide();
    $(".NoOutage").show();
    $("#uiStatus").text("There was an error submitting your outage. Please call 877.778.2222 to report an outage.");
    $("#uiOutageHeader").text("Error reporting your outage");
}


function OutageReportUpdate(returnValue, etrMsg) {
    $('#divETR').show();
    $('#divStLightOutages').show();
    $('#divEmergencies').show();
    if (returnValue == true) {
        $('.NoOutage').show();
        $('#uiStatus').text('Estimated Time of Restoration is : ' + etrMsg);
        $('.OutageDisp').hide();
    }
    else {
        $('.OutageDisp').hide();
        $(".NoOutage").show();
        $("#uiStatus").text('<b>Please note:</b> if you reported an outage within the past fifteen minutes it may not yet be reflected on this site.');
    }
}

// Program Enrollments functions -- 
function GetPrograms() {
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetPrograms",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: PrgmPopulate,
        error: PrgmError,
        complete: PrgmComplete
    });
}
function PrgmPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        ShowLearMoreLink();
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        ShowLearMoreLink();
        return;
    }
    if (msg.d.ProgramList != null && msg.d.ProgramList.length > 0) {
        $('#uiPrograms').empty();
        $.each(msg.d.ProgramList, function (idx) {
            if (this.Name == findMessage('PEAKREWARDSLEARN_PROGRAM_NAME')) {
                $('#uiPrograms').append('<li><a href=' + this.Url + ' target=_blank >' + this.Name + '</a></li>');
            }
            else {
                $('#uiPrograms').append('<li><a href=' + this.Url + ' target=' + this.Target_loc + '>' + this.Name + '</a></li>');
            }

        });
    }
    else {
        ShowLearMoreLink();
    }
}
function PrgmError(xhr, ajaxOptions, thrownError) {
    ShowLearMoreLink();
}
function PrgmComplete(xhr, status) {
    // take away wait symbol and display error message if any
    outageWaitCount--;
    checkAndHideWaiting();
    $("#uiPnlProgramDesign1").css("visibility", "visible");
    if (status == 'timeout' || status != 'success') {
        //show learn more about peakrewards link
        ShowLearMoreLink();
    }
}

function ShowLearMoreLink() {
    $('#uiPrograms').empty();
    $('#uiPrograms').append('<li><a href=' + findMessage('PEAKREWARDSLEARN_PROGRAM_URL') + ' target=_blank>' + findMessage('PEAKREWARDSLEARN_PROGRAM_NAME') + '</a></li>');
}

// Planned outage functions -- 
function GetOutages() {
    //Hide any previous errors
    $("#uiOutageError").hide();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetOutages",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: OutagePopulate,
        error: OutageError,
        complete: OutageComplete
    });
}

function DisplayOutageError() {
    $("#uiOutagesBlock").css("visibility", "hidden");
    $("#uiPlannedOutagePnl").css("visibility", "hidden");
    if ($('#uiOutageError').length) {
        $('#uiOutageError').text(findMessage('ERROR_MSG_OUTAGES'));
    }
    else {
        $("#uiPlannedOutagePnl").before('<span id="uiOutageError" class="Error">' + findMessage('ERROR_MSG_OUTAGES') + '</span>');
    }
}

function OutagePopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        DisplayOutageError();
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        DisplayOutageError();
        return;
    }
    $('#uiPremiseAddr').text(msg.d.PremiseAddress);
    if (msg.d.Status != null) {
        $('#divNoOutageStatus').hide();
        $('#divOutageStatus').removeClass("NoOutage");
        $('#divOutageStatus').show();
        $('#uiAsOf').text(msg.d.AsOf);
        $('#uiStatus').text(msg.d.Status);
    } else {
        $('#divNoOutageStatus').show();
        $('#divOutageStatus').hide();
    }
    if (msg.d.OutageList != null && msg.d.OutageList.length > 0) {
        $('#divNoPlannedOutage').hide();
        $('#divPlannedOutage').removeClass("NoOutage");
        $('#uiPlannedOutage').empty();
        $('#uiPlannedOutage').append('<tr> <th>Number</th> '
			+ '<th>Status</th> <th>Planned Start</th> <th>Planned End</th></tr>');
        $.each(msg.d.OutageList, function (idx) {
            var rowTag = "";
            if (idx < 1) rowTag = "<tr class='head'>";
            else rowTag = "<tr class='tail'>";
            $('#uiPlannedOutage').append(rowTag + '<td>' + this.outageNumber + '</td><td>'
                + this.outageStatus + '</td><td>' + this.plannedStartDateTime + '</td><td>'
                + this.plannedEndDateTime + '</td></tr>');
        });
        POToggle();
    }
}
function OutageError(xhr, ajaxOptions, thrownError) {
    DisplayOutageError();
}
function OutageComplete(xhr, status) {
    outageWaitCount--;
    checkAndHideWaiting();
    $("#uiOutagesBlock").css("visibility", "visible");
    $("#uiPlannedOutagePnl").css("visibility", "visible");
    if (status == 'timeout' || status != 'success') {
        DisplayOutageError();
    }
}

var poToggle = 1;
function POToggle() {
    poToggle = poToggle * (-1);
    var porows = $('#uiPlannedOutage tr');
    if (porows.length > 2) {
        if (poToggle > 0) {
            porows.filter('.tail').show();
            $('#POMore').text('less ...');
        } else {
            porows.filter('.tail').hide();
            $('#POMore').text('more ...');
        }
    } else {
        $('#divPlannedOutage .divPO').hide();
    }

}

function checkAndHideWaiting() {
    if (outageWaitCount <= 0) {
        $("#uiOutagesComboLoading").hide();
    }
    if (summaryWaitCount <= 0) {
        $("#uiSummaryComboLoading").hide();
    }
    if (amiWaitCount <= 0) {
        $("#uiWaitHoodComp").hide();
    }
}

//*************
// SER historical data functions -- 
function showSERHistoricalData() {
    //hide error
    $('#uiOpowerError').removeClass('active');
    $('#neighbourhoodCompareTab').removeClass('active');
    $('#neighbourhoodCompareBody').removeClass('active');
    $('#billCompareTab').removeClass('active');
    $('#billCompareBody').removeClass('active');
    $('#SERHistoricalData').addClass('active');
    $('#SERHistoricalDataTab').addClass('active');

    $.ajax({
        type: "POST",
        async: false,
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetBGESERSavingsSummary",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: SERSavingsPopulate,
        error: SERSavingsError,
        complete: SERSavingsComplete
    });
}

function DisplaySERSavingsError() {
    // take away wait symbol and display error message
    //hide error
    $('#neighbourhoodCompareTab').removeClass('active');
    $('#neighbourhoodCompareBody').removeClass('active');
    $('#billCompareTab').removeClass('active');
    $('#billCompareBody').removeClass('active');
    $('#SERHistoricalData').removeClass('active');

    $('#uiOpowerError').addClass('active');
    $('#uiOpowerErrorTxt').html(findMessage('SER_PARTIAL_ERROR')); // Partial Data Error
}

function SERSavingsPopulate(msg) {
    $('#SERHistoricalData').show();
    if (jQuery.isEmptyObject(msg.d)) {
        DisplaySERSavingsError();
        return;
    }
    else if (msg.d.ErrorCode == "E00225") {
        //Just Hide SER tab - Not  Savings display season
        $('#SERHistoricalData').hide();
        $('#SERHistoricalDataTab').hide();
        showHoodComparison();
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        DisplaySERSavingsError();
        return;
    }

    $('#uiOpowerError').removeClass('active');

    $('#uiSavingsDescription').html(findMessage('SER_DETAILED_DESC'));
    $('#uiSavingsDay1').text(msg.d.SavingsDay);
    $('#uiSavingsDay').text(msg.d.SavingsDay);
    $('#uiTotalSavings').text(msg.d.TotalSeasonSavings);
    // $('#uisavingsMsg').text(msg.d.SavingsDayEarnings);

    if (msg.d.SavingsDayKWH == "-1 kWh") {
        $('#noData').show();
        $('#noData').css({ 'padding-bottom': '40px' });
        $('#noData').css({ 'padding-top': '45px' });
        $('#SMDescription').css({ 'padding-bottom': '0px' });
        $('#SMDetails').hide();
    }
    else {
        $('#noData').hide();
        $('#SMDetails').show();
        if (msg.d.SavingsDayKWH != "0 kWh" && msg.d.SavingsDayEarnings == "$0.00")
            $('#uisavingsMoney').text("*");
        else
            $('#uisavingsMoney').text(msg.d.SavingsDayEarnings);
        $('#uisavingsKWH').text(msg.d.SavingsDayKWH);
    }
    $('#uiSavingsYear').text(msg.d.SavingsSeason);

    var strSavingsMsg = $('#uisavingsMsg').text();
    var n = strSavingsMsg.indexOf("available");
    if (n > 0) {
        $('#uisavingsMsg').css({ 'font-size': '12px' });
        $("#uiSavingsYear").append('&nbsp;');
        $("#uiSavingsDay").append('&nbsp;');
    }
    else
        $('#uisavingsMsg').css({ 'font-size': '20px' });

    if (msg.d.BGESERSavingList != null && msg.d.BGESERSavingList.length > 0) {

        $('#uiSERHistory').empty();
        $.each(msg.d.BGESERSavingList, function (idx) {
            var rowTag = "";
            if (idx < 1) rowTag = "<tr>";
            else rowTag = "<tr>";

            var image;
            if (this.MoneySavings != "$0.00") {
                image = "<img src='/Style%20Library/BGE/Images/smile.png' />";
            }
            else {
                image = " ";

            }
            if (this.SavingsDate == "TOTAL") {
                this.SavingsDate = "<b>" + this.SavingsDate + "</b>";
            }
            else {
                if (this.CalculationMethod != "ACTUAL") {
                    if (this.TypicalUsage == "0") this.TypicalUsage = "*";
                    if (this.ActualUsage == "0") this.ActualUsage = "*";
                    if (this.EnergySavings == "0") this.EnergySavings = "*";
                    if (this.MoneySavings == "$0.00") this.MoneySavings = "*";
                }
                else {
                    if (this.EnergySavings != "0" && this.MoneySavings == "$0.00")
                        this.MoneySavings = "*";

                }

            }
            $('#uiSERHistory').append(rowTag + '<td>' + this.SavingsDate + '</td><td>'
                + this.TypicalUsage + '</td><td>' + this.ActualUsage + '</td><td>'
                + this.EnergySavings + '</td><td>' + this.MoneySavings + '</td><td>' + image + '</td></tr>');
        });

    }
    else {
        $('#expanderHead').hide();
        $('#savings-day-historical').hide();
    }
}

function SERSavingsError(xhr, ajaxOptions, thrownError) {
    DisplaySERSavingsError();
}

function SERSavingsComplete(xhr, status) {
    amiWaitCount--;
    checkAndHideWaiting();
    if (status == 'timeout') {
        DisplaySERSavingsError();
    }
}

//Ahow Alert Message functions --
function ShowAlertMessage() {
    $('#uiSERPRAlert').hide();
    $.ajax({
        type: "POST",
        url: "/_layouts/Bge.Canp/RenderServices.asmx/GetAlertMessage",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        timeout: CanpAjaxTO,
        global: false,
        success: ShowMsgPopulate,
        error: ShowMsgError,
        complete: ShowMsgComplete
    });
}

function ShowMsgPopulate(msg) {
    if (jQuery.isEmptyObject(msg.d)) {
        $('#uiSERPRAlert').hide();
        return;
    }
    else if (!jQuery.isEmptyObject(msg.d.ErrorMessage)) {
        $('#uiSERPRAlert').hide();
        return;
    }
    if (msg.d.alertMessage != null && msg.d.alertMessage.length > 0) {
        $('#uiSERPRAlert').show();
        $('#uiAlertMessage').html(msg.d.alertMessage);
    }
}

function ShowMsgError(xhr, ajaxOptions, thrownError) {
    return;
}

function ShowMsgComplete(xhr, status) {
    summaryWaitCount--;
    checkAndHideWaiting();
    return;
}

