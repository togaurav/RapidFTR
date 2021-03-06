$(document).ready(function() {
    initOrderingColumns();
    $("a.delete").click(deleteItem);
    $("a.moveDown").click(moveDown);
    $("a.moveUp").click(moveUp);
    $("input#save_order").click(saveOrder);
    $("input#save_field_order").click(saveFieldOrder);
    $("a.add_field").click(toggleFieldSection);
    $("ul.field_types a").click(showFieldDetails);
    $(document).delegate("select.fieldLocation", "change", saveFieldLocation);
});

function toggleFieldSection(){
    $(".fields_section").toggleClass("hide");
}

function showFieldDetails(){
    $("ul.field_types a").removeClass("sel");
    $(this).addClass("sel");
    var fieldtype1 = ["text_field","text_area","numeric_field","date_field"];
    var fieldtype2 = ["check_box","radio_btn","select_box"];

    $("#field_details_options, #field_details").slideUp("fast");

    if ($.inArray(this.id, fieldtype1) > -1)
    {
        $("#field_details").slideDown("fast");
    }
    else
    {
            $("#field_details_options").slideDown("fast");
    }
}

function onFormSectionDetailsEditPage() {
    return $('#editFormDetails').length === 1;
}

function nameIsTheFirstRow(){
  return $("#nameRow").index() == 0;
}

function initOrderingColumns() {
    var mainContainer = "form_sections";

    $("#" + mainContainer + " tbody tr").each(function(index, element) {
        $("a.moveDown", element).show();
        $("a.moveUp", element).show();
    });

    var fieldToStartFrom = 1;
    if (onFormSectionDetailsEditPage() && !nameIsTheFirstRow()){
        fieldToStartFrom = 0;
    }

    $("#"+mainContainer+" tbody tr:eq("+fieldToStartFrom+")").each(function(index, element){

	$("a.moveUp", element).hide();
    $("a.moveDown",element).css("display","inline");

    });

    $("#" + mainContainer + " tbody tr:last").each(function(index, element) {
        $("a.moveDown", element).hide();
        $("a.moveUp", element).show();
    });

    $("#" + mainContainer + " tbody tr").each(function(index, element) {
        $(element).find(".updatedFormSectionOrder :input").val(index + 1);
    });
}
function moveUp() {
    var row = $(this).parents("tr");
    var prevRow = row.prev("tr");
    prevRow.before(row);
    initOrderingColumns();
    return false;
}
function changeDirection(fieldName, isUp) {
    var curAction = $('#changeDirection').attr('action');
    if (isUp) {
        curAction += 'move_up';
    } else {
        curAction += 'move_down';
    }
    $('#changeDirection').attr('action', curAction);
    $('#changeDirectionFieldName').val(fieldName);
    $('#changeDirectionSubmit').click();
}
function deleteItem() {
    var td = $(this).parents("td");
    var fieldName = td.find("input[name=field_name]").val();
    $('#deleteFieldName').val(fieldName);
    if (confirm(I18n.t("messages.delete_item"))) {
        $('#deleteSubmit').click();
    }
}
function moveDown() {
    var row = $(this).parents("tr");
    var prevRow = row.next("tr");
    prevRow.after(row);
    initOrderingColumns();
    return false;
}

function callback(data) {
    if ($('#form_sections').length === 1) {
        $("#form_sections").html($(data).find("#form_sections"));
        $("a.moveDown").bind("click", moveDown);
        $("a.moveUp").bind("click", moveUp);
        initOrderingColumns();
        $("#successNotice").show();
    }
}
function saveOrder(event) {
    var form_order = getUpdatedOrderings('.updatedFormSectionOrder :input');


    $.ajax({

        url: '/form_section/save_form_order',
        type: "POST",
        data: {"form_order" : form_order},
        success: function(data) {
            callback(data);
        }
    });
}

function saveFieldOrder(event) {
    var form_order = getUpdatedOrderings('.updatedFormSectionOrder :input');
    var formId = $('#sectionId').html();
   var saveFieldOrderURL=$(this).data('submit_url');

    $.ajax({
        url: saveFieldOrderURL,
        type: "POST",
        data: {
            "form_order" : form_order,
            "formId" : formId
        },
        success: function(data) {
           callback(data);
        }
    });
}

function saveFieldLocation(event) {
    var name = $(this).attr("name");
    var id = /(.*)_destination_form_id/.exec(name)[1];
    var to_form_section = $(this).attr("value");
    var selection = this.options[this.selectedIndex].text;
    var formId = $('#sectionId').html();
    var message = confirm(I18n.t("messages.move_item", {selection_key: selection}));
    if (message) {
        $.ajax({
            url: '/fields/' + id,
            type: "PUT",
            data: {
                "destination_form_id" : to_form_section,
                "formsection_id" : formId
            },
            success:function(data, status, xmlHttpRequest) {
                location.reload();
            },
            error: function(xmlHttpRequest, status, error) {
                alert("in error " + error);
            }
        });

    }

}

function getUpdatedOrderings(inputSelector) {
    var form_order = {};
    var updatedOrderings = $(inputSelector);
    $.each(updatedOrderings, function() {
        var name = $(this).attr("name");
        var id = /form_order\[(.*)\]/.exec(name)[1];
        form_order[id] = $(this).attr("value");
    });
    return form_order;
}


$(function() {
    $("#locale").change( function(event){
        var language_field = $(event.target);
        var locale = language_field.val();
        $(".translation_forms").hide();
        $("div ."+locale).show();
    });
});