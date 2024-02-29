var LISTA_RAFINARE = function() {
  var sSelectorSuperListaRezultate = '#super-container-lista-rezultate';
  var sSelectorListaRezultate = '#container-lista-rezultate';
  var sSelectorListaRezultateExtinse = '#container-lista-rezultate-extinse';
  var sSelectorListaPP = '#super-container-lista-pp';
  var sSelectorForm = '.form_filtre';
  var xhr = null;
  function useLiveReloadResponse(response, _bModificaLocalizare=false) {
      $('#modal-titlu-lista').html(response.aDetaliiTitlu.nume_iag.join("<br>"));
      $('#modal-exit-' + aTexte.general.sNumeExitModal + ' .nume-imoagent-propus').html(response.aDetaliiTitlu.nume_iag[0]);
      $('#modal-exit-' + aTexte.general.sNumeExitModal + ' .descriere-imoagent-propus').html(response.aDetaliiTitlu.nume_iag[1]);
      $('#idCautare').val(response.iIdCautare);
      $('#titlu_anunturi_js').html(response.aDetaliiTitlu.titlu);
      HARTA_PAGINARE.populateList(response.content, false, true);
      LISTA_RAFINARE.getObjListaRezultate().html(response.content);
      LISTA_RAFINARE.getObjListaRezultateExtinse().html(response.content_extins);
      LISTA_RAFINARE.updateTitleAndMeta(response);
      var newUrl = '';
      if (bModHarta) {
          currentUrlLista = response.urlHarta.split('#')[0];
          newUrl = currentUrlLista;
          var cookieName = 'chp';
          if (typeof (aDetaliiHarta.judet) != 'undefined') {
              cookieName += '_' + aDetaliiHarta.judet
          }
          ;var sCookieHash = get_cookie(cookieName);
          if (sCookieHash != null && window.location.hash == '') {
              newUrl += '#' + sCookieHash
          } else if (window.location.hash != '') {
              newUrl += window.location.hash
          }
      } else {
          currentUrlLista = response.url.split('#')[0];
          if (!_bModificaLocalizare) {
              if (HASH_PROCESSOR.toString() != '') {
                  newUrl = currentUrlLista + "#" + HASH_PROCESSOR.toString()
              } else {
                  newUrl = currentUrlLista
              }
          } else {
              newUrl = currentUrlLista
          }
      }
      window.history.pushState(response, document.title, newUrl);
      LISTA_RAFINARE.showHideFiltreLicitatii();
      LISTA_RAFINARE.showHideResetFilters();
      LISTA_RAFINARE.cautareSalvata(response);
      LISTA_RAFINARE.butoaneHartaLista(response);
      LISTA_RAFINARE.actualizeazaLogData(response);
      LISTA_RAFINARE.actualizeazaCarouselAnsambluri(response)
  }
  ;function checkToAbortAjax() {
      if (xhr != null) {
          xhr.abort();
          xhr = null
      }
  }
  ;function esteEligibilPtRafinare() {
      var bValid = true;
      $(sSelectorForm).find('.custom-container').each(function() {
          var bAplicaValidare = false;
          var container = this;
          $(this).find('input, select').each(function() {
              if ($(container).find('.inputs').hasClass('tooltipstered')) {
                  $(container).find('.inputs').tooltipster('destroy').removeAttr('title')
              }
              $(this).removeClass('error');
              if ($.trim($(this).val()).length) {
                  bAplicaValidare = true;
                  return false
              }
          });
          if (bAplicaValidare) {
              bValid = valideazaRafinareCustom($(this));
              if (!bValid) {
                  return bValid
              }
          }
      });
      if (bRafinareCustom && bValid) {
          $('body').trigger('inchideDropdowns')
      }
      return true
  }
  ;function valideazaRafinareCustom(oFormRafinare) {
      var textInputs = oFormRafinare.find('input[type=tel], select');
      var value1 = $(textInputs[0]).removeClass('error').val() ? $(textInputs[0]).removeClass('error').val().split('.').join('') : $(textInputs[0]).removeClass('error');
      var value2 = $(textInputs[1]).removeClass('error').val() ? $(textInputs[1]).removeClass('error').val().split('.').join('') : $(textInputs[1]).removeClass('error');
      if (value1.length && value2.length && parseInt(value1) > parseInt(value2)) {
          var msg = "Valoarea minim&#259; trebuie s&#259; fie mai mic&#259; dec&#226;t valoarea maxim&#259;";
          $(textInputs[0]).addClass('error');
          $(textInputs[1]).addClass('error');
          oFormRafinare.find('.inputs').attr('title', msg).tooltipster({
              maxWidth: 200,
              contentAsHTML: true
          });
          return false
      }
      return true
  }
  ;function aplicaRafinare(bLocalizare) {
      timingStartRafinare = new Date().getTime();
      bLocalizare = typeof bLocalizare !== 'undefined' ? bLocalizare : false;
      if (bModHarta) {
          $('#map').append('<div class="incarcare"><div id="loader_gif"></div></div>')
      }
      HARTA_PAGINARE.preloadList(true);
      $('.icon-portal-refresh').addClass('rotate');
      $('.total_anunturi_mobile_js').hide();
      let oPost = obtineDatePentruFiltrare(bLocalizare);
      console.log(oPost,"bLoc : ",bLocalizare);
      $('body').trigger('clearTimerLog');
      xhr = $.post(aTexte.general.sPortalUrl + "lista/raf-multiplu", oPost).done(function(response) {
          response = $.parseJSON(response);
          if (typeof response.redirectLista !== "undefined") {
              let url = response.url.replace(/^\//g, '');
              if (url.indexOf(aTexte.general.sPortalUrl) === false) {
                  url = aTexte.general.sPortalUrl + url
              }
              window.location = url;
              return false
          }
          trackExperimenteRaspunsAjax(response);
          aTexte.lista.idLista = response.iIdCautare;
          aDetaliiHarta = response.aDetaliiHarta;
          if (typeof response.anunturiPromo !== "undefined") {
              aTexte.lista.anunturiPromo = response.anunturiPromo
          }
          timingRaspunsRafinare = new Date().getTime() - timingStartRafinare;
          if (!liveReloadCompatible) {
              if (HASH_PROCESSOR.toString() != '') {
                  window.location = aTexte.general.sPortalUrl + response.url.replace(/^\//g, '') + "#" + HASH_PROCESSOR.toString()
              } else {
                  window.location = aTexte.general.sPortalUrl + response.url.replace(/^\//g, '')
              }
              return false
          }
          modificaTitluFiltrePrincipale(response);
          modificaFiltreMaiMulte(response);
          modificaBreadcrumb(response);
          modificaAgentii(response);
          modificaVariabileBannere(response);
          modificaVariabilagGaFakePage(response);
          modificaVariabileIag(response);
          modificaSortare(response);
          modificaBannerCampanie(response);
          response.checkboxes = {};
          $(sSelectorForm + " input:checkbox" + ", input.shortcut-raf").each(function() {
              response.checkboxes[$(this).attr('id')] = $(this).prop('checked')
          });
          response.radio = {};
          $(sSelectorForm + " input:radio").each(function() {
              response.radio[$(this).attr('id')] = $(this).attr('checked')
          });
          response.inputsText = {};
          $(sSelectorForm).find('input:text,input[type="tel"]').each(function() {
              response.inputsText[$(this).attr('id')] = $(this).val()
          });
          response.selectboxes = {};
          $(sSelectorForm + " select").each(function() {
              response.selectboxes[$(this).attr('id')] = $(this).val()
          });
          response.sortare = $('#sort-label').html();
          response.cautator = CAUTARE.date_cautator || CAUTARE.obtineDateCautator();
          useLiveReloadResponse(response, bLocalizare);
          if (bModHarta) {
              $('body').trigger('reloadHarta', response).trigger('reloadAnalytics')
          } else {
              $('body').trigger('reloadBanners').trigger('reloadAnalytics').trigger('resetHeightImagini').trigger('repaintLista');
              logAfisariTimer = setTimeout(function() {
                  $('body').trigger('reloadPolePosition').trigger('reloadLogAfisari').trigger('reloadLogAfisariViewport')
              }, logAfisariTimerMilliseconds)
          }
          updateReferrer(document.URL);
          pushAfisariAnunturiLista();
          HARTA_UTILS.trimiteEventClickAnunt();
          if (typeof response.analytics != 'undefined') {
              completezaDateAnalytics(response.analytics)
          }
          if (typeof (RtbHouse) != 'undefined' && typeof (response.iIdCautare) != 'undefined') {
              $('body').trigger('reloadRtbHouseIframe', ['category', {
                  sNumeCategorie: response.sNumeCategorieDedicatRTB
              }])
          }
          if (typeof response.iIdCautare !== "undefined" && typeof aTexte !== "undefined" && typeof aTexte.lista !== "undefined") {
              aTexte.lista.idLista = response.iIdCautare
          }
          LISTA_RAFINARE.trimiteProfilSearchDataLayer(response);
          LISTA_RAFINARE.fetchAnunturiRecomandate();
          $('body').trigger('endRafinare')
      })
  }
  ;function modificaTitluFiltrePrincipale(restore) {
      if (typeof (restore.filtre) != 'undefined') {
          filtre = restore.filtre;
          for (var key in filtre) {
              var text = filtre[key];
              var _el = $(sSelectorForm + ' #grupa_' + key);
              var _label = _el.closest(".filter_group").find(".filter_title");
              var _removeBtn = _el.closest(".filter_group").find(".delete-rafinare-copii");
              if (_label.text() === text || (typeof _el.attr("title") != 'undefined' && String(text.toLowerCase()) === String(_el.attr("title")).toLowerCase())) {
                  _el.html(_el.attr("title") + '<span class="caret"></span>');
                  _el.removeClass('yellow-filter');
                  _removeBtn.addClass('hidden-element')
              } else {
                  _el.html(text + '<span class="caret"></span>');
                  _el.addClass('yellow-filter');
                  _removeBtn.removeClass('hidden-element')
              }
          }
      }
  }
  ;function modificaFiltreMaiMulte(restore) {
      if (typeof (restore.total) != 'undefined') {
          $('.icon-portal-refresh').removeClass('rotate');
          $('.total_anunturi_js').html(restore.iTotalAnunturi).removeClass("hidden");
          var counterText = " anun&#355;";
          if (restore.iTotalAnunturi != 1) {
              counterText += "uri"
          }
          $('.total_anunturi_sufix').html(counterText);
          $('.total_anunturi_mobile_js.filtre-header').html(restore.iTotalAnunturi).show().addClass('animated zoomIn');
          $('.total_anunturi_mobile_js.titlu-counter').html(restore.iTotalAnunturi + counterText).show().addClass('animated zoomIn')
      }
      if (typeof (restore.contorTotal) != 'undefined') {
          var contor = restore.contorTotal;
          if (contor == 0) {
              $("#btn_vezi_filtrele").find(".counter").addClass("hidden")
          }
          if (contor > 0) {
              $("#btn_vezi_filtrele").find(".counter").removeClass("hidden").text("(" + contor + ")")
          }
      }
  }
  ;function modificaDependinteFiltruLocuinteNoi(restore) {
      if (typeof (restore.checkboxes) != 'undefined') {
          if (typeof (restore.checkboxes.shortcut_locuinte_noi) != 'undefined') {
              adaugaDependinteFiltruLocuinteNoi()
          } else {
              stergeDependinteFiltruLocuinteNoi()
          }
      }
  }
  ;function adaugaDependinteFiltruLocuinteNoi() {
      var filtruCompus = $('.locuinte_noi_compuse');
      var containerFiltruIntervalParent = filtruCompus.closest('.two-select-boxes');
      containerFiltruIntervalParent.find('.selectpicker_wp.to').addClass("hidden");
      var containerFiltruInterval = containerFiltruIntervalParent.find('.selectpicker_wp.from');
      var dropdownToggle = containerFiltruInterval.find('.dropdown');
      var deleteRafinare = containerFiltruInterval.find('.delete-rafinare');
      containerFiltruInterval.find('select').prop('disabled', true);
      containerFiltruInterval.find('select').val(parseInt(new Date().getFullYear()) - 5).selectpicker("refresh");
      containerFiltruInterval.addClass('disabled');
      dropdownToggle.addClass('yellow-filter').addClass('disabled');
      deleteRafinare.removeClass('hidden-element')
  }
  ;function stergeDependinteFiltruLocuinteNoi() {
      var filtruCompus = $('.locuinte_noi_compuse');
      var containerFiltruIntervalParent = filtruCompus.closest('.two-select-boxes');
      var containerFiltruIntervalFrom = containerFiltruIntervalParent.find('.selectpicker_wp.from');
      var containerFiltruIntervalTo = containerFiltruIntervalParent.find('.selectpicker_wp.to');
      var dropdownToggleFrom = containerFiltruIntervalFrom.find('.dropdown');
      var dropdownToggleTo = containerFiltruIntervalTo.find('.dropdown');
      var deleteRafinareFrom = containerFiltruIntervalFrom.find('.delete-rafinare');
      var deleteRafinareTo = containerFiltruIntervalTo.find('.delete-rafinare');
      containerFiltruIntervalParent.find('select').prop('disabled', false);
      containerFiltruIntervalParent.find('select').val('').selectpicker("refresh");
      containerFiltruIntervalParent.remove('disabled');
      containerFiltruIntervalFrom.removeClass("disabled").removeClass("hidden");
      containerFiltruIntervalTo.removeClass("disabled").removeClass("hidden");
      dropdownToggleFrom.removeClass('yellow-filter').removeClass('disabled');
      dropdownToggleTo.removeClass('yellow-filter').removeClass('disabled');
      deleteRafinareFrom.addClass('hidden-element');
      deleteRafinareTo.addClass('hidden-element')
  }
  ;function modificaBreadcrumb(restore) {
      if (typeof (restore.breadcrumb) != 'undefined') {
          $('#breadcrumb_js').html(restore.breadcrumb)
      }
  }
  ;function modificaAgentii(restore) {
      if (typeof (restore.agentii) != 'undefined') {
          $('#box_agentii_js').html(restore.agentii)
      }
  }
  ;function modificaVariabileBannere(restore) {
      if (typeof (restore.banners) != 'undefined') {
          var banners = restore.banners;
          if (typeof (googletag) != 'undefined' && typeof (googletag.pubads) == 'function') {
              googletag.pubads().setTargeting("dfp_agentii_de_top", banners.sCodBannerAgentiiTop);
              googletag.pubads().setTargeting("dfp_default", banners.sCodBannerAgentiiFooter)
          }
      }
  }
  ;function modificaVariabilagGaFakePage(restore) {
      if (typeof (restore.gaFakePage) != 'undefined') {
          sGaFakePage = restore.gaFakePage
      }
  }
  ;function modificaSortare(restore) {
      if (typeof (restore.full_text) != 'undefined' && restore.full_text) {
          $('.sortare.toplisting').html(js_text('Relevan&#355;&#259;'))
      } else {
          $('.sortare.toplisting').html(js_text('Top Listing'))
      }
      if ((typeof (restore.bAfiseazaSortareRelevanta) === 'undefined' || !restore.bAfiseazaSortareRelevanta)) {
          $('a.sortare.selected[data-val=sctl-none]').removeClass('selected').addClass('hide');
          if ($('a.sortare.selected').length < 1) {
              $('a.sortare[data-val=tl-none]').addClass('selected')
          }
      }
      if (typeof (restore.bAfiseazaSortareRelevanta) !== 'undefined' && restore.bAfiseazaSortareRelevanta) {
          $('a.sortare[data-val=sctl-none]').removeClass('hide')
      }
      $('#sort-label').html($('a.sortare.selected').html());
      if ($('a.sortare.selected').html() != 'Sortare' && typeof ($('a.doarIntern')) != 'undefined') {
          $('a.doarIntern').hide()
      }
  }
  ;function modificaBannerCampanie(response) {
      let newHtmlBannerCampanie = response.htmlBannerCampanie;
      let bannerElement = document.getElementById('bannerCampanie');
      if (bannerElement) {
          bannerElement.innerHTML = newHtmlBannerCampanie
      }
  }
  ;function modificaVariabileIag(restore) {
      bIgnorePreaMulteAnunturi = false;
      if (typeof restore.iTotalAnunturi != 'undefined') {
          aTexte.lista.iTotalAnunturi = parseInt(restore.iTotalAnunturi)
      }
  }
  ;function rafineazaMultiplu() {
      pushAfisariAnunturiLista();
      HARTA_UTILS.trimiteEventClickAnunt();
      $("body").on("aplica_rafinare", function(event, params) {
          if ($("#2114").length === 1 && $("#b_cautator_categorie_radio").length === 1) {
              var sSubcateg = $('#b_cautator_categorie_radio').val();
              var oMultiSelect = $("#2114").closest("div").find("input:checked");
              if (sSubcateg === "101" && $("#2114:checked").length === 1 && oMultiSelect.length === 1) {
                  $('#b_cautator_categorie_radio').val(aTexte.lista.iSubcategorie = "104").selectpicker("refresh")
              } else if (sSubcateg === "104" && ($("#2114:checked").length !== 1 || oMultiSelect.length !== 1)) {
                  $('#b_cautator_categorie_radio').val(aTexte.lista.iSubcategorie = "101").selectpicker("refresh")
              }
          }
          checkToAbortAjax();
          var bForced = typeof (params) != 'undefined' && params.forced;
          var bLocalizare = typeof (params) != 'undefined' && params.localizareModificata;
          if (esteEligibilPtRafinare() || bForced) {
              aplicaRafinare(bLocalizare);
              bRafinareCustom = false
          }
      });
      $(sSelectorForm + ' .dropdown').on('hide.bs.dropdown', function() {
          if (esteEligibilPtRafinare() && bRafinareCustom) {
              LISTA_RAFINARE.reseteazaCampuriCustomSauCampuriPredefinite($(this));
              LISTA_RAFINARE.afiseazaButonInchidereDropdown($(this));
              checkToAbortAjax();
              aplicaRafinare();
              bRafinareCustom = false
          }
          $(this).find('input.error, select.error').removeClass('error').val('default');
          $(this).find('input.error, select.error').removeClass('error').selectpicker("refresh");
          if ($(this).find('.inputs').hasClass('tooltipstered')) {
              $(this).find('.inputs').tooltipster('destroy').removeAttr('title')
          }
      });
      $(sSelectorForm + ' input:checkbox, ' + sSelectorForm + ' .selectpicker' + ", input.shortcut-raf").change(function() {
          if (!$(this).hasClass('checkbox-raf')) {
              $(this).closest('li').parent().parent().removeClass('open')
          }
          ;var container = $(this).parent().parent().find('.custom-container');
          if (container.length) {
              var bValid = valideazaRafinareCustom(container);
              LISTA_RAFINARE.reseteazaCampuriCustomSauCampuriPredefinite(container.parent());
              if (bValid) {
                  $(this).closest('li').parent().parent().removeClass('open')
              }
          } else {
              if (!$(this).hasClass('checkbox-raf')) {
                  $(this).closest('li').parent().parent().removeClass('open')
              }
          }
          ;var dropdown = $(this).parents('.dropdown-menu');
          if (dropdown.length) {
              LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
          } else {
              var selectpicker = $(this).parents('.selectpicker_wp');
              if (selectpicker.length) {
                  LISTA_RAFINARE.afiseazaButonInchidereDropdown(selectpicker)
              }
          }
          ;var val = $(this).val();
          if ($(this).prop('checked')) {
              $(this).closest('li').addClass('checked');
              $('#checkbox_' + val + ',#shortcut_' + val).prop('checked', true).parent().addClass('checked');
              if (val == 'locuinte_noi') {
                  adaugaDependinteFiltruLocuinteNoi()
              }
          } else {
              $(this).closest('li').removeClass('checked');
              $('#checkbox_' + val + ',#shortcut_' + val).prop('checked', false).parent().removeClass('checked');
              if (val == 'locuinte_noi') {
                  stergeDependinteFiltruLocuinteNoi()
              }
          }
          ;var locuinte_noi = true;
          $('.locuinte_noi_compuse').each(function() {
              if (!$(this).prop('disabled')) {
                  locuinte_noi = false
              }
          });
          if (locuinte_noi) {
              $('#shortcut_locuinte_noi').prop('checked', true).parent().addClass('checked')
          } else {
              $('#shortcut_locuinte_noi').prop('checked', false).parent().removeClass('checked')
          }
          $('body').trigger('aplica_rafinare')
      });
      $(sSelectorForm + ' .custom-container select, ' + sSelectorForm + ' .two-select-boxes select, ' + sSelectorForm + ' .single-select-box select').change(function() {
          var dropdown = $(this).parents('.dropdown-menu');
          if (dropdown.length) {
              LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
          }
          valideazaSelecturiPereche($(this).parents('.two-select-boxes'));
          $('body').trigger('aplica_rafinare')
      });
      $(sSelectorForm + ' input:radio').change(function() {
          var dropdown = $(this).parents('.dropdown-menu');
          if (dropdown.length) {
              LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
          }
          $(this).closest('li').parent().parent().removeClass('open');
          if ($(this).prop('checked')) {
              $(this).parent().parent().find('li').removeClass('checked');
              $(this).closest('li').addClass('checked')
          } else {
              $(this).closest('li').removeClass('checked')
          }
          $('body').trigger('aplica_rafinare')
      });
      $('.buton-aplica.aplica-mai-multe').click(function(event) {
          $(sSelectorForm + ' .imo-dropdown').removeClass('open');
          $(sSelectorForm + ' .imo-dropdown-menu').removeClass('open')
      });
      $(sSelectorForm + ' .link-cauta, ' + sSelectorForm + ' .buton-cuvinte-cheie').click(function(event) {
          event.preventDefault();
          event.stopPropagation();
          bRafinareCustom = true;
          LISTA_RAFINARE.reseteazaCampuriCustomSauCampuriPredefinite($(this).parents('.dropdown-menu'));
          $('body').trigger('aplica_rafinare');
          LISTA_RAFINARE.afiseazaButonInchidereDropdown($(this).parents('.dropdown-menu'))
      });
      $('#searchCriteria').keyup(function(e) {
          if (e.which == 13) {
              e.preventDefault();
              e.stopPropagation();
              $('body').trigger('aplica_rafinare');
              textSearch = false
          } else {
              textSearch = true
          }
      });
      $('#searchCriteria').focusout(function() {
          if (textSearch) {
              $('body').trigger('aplica_rafinare');
              textSearch = false
          }
      });
      $(sSelectorForm + ' .dropdown.principale').on('show.bs.dropdown', function() {
          $(sSelectorForm + ' .imo-dropdown-menu').removeClass('open');
          $(sSelectorForm + ' .imo-dropdown').removeClass('open')
      });
      $('body').on("inchideDropdowns", function() {
          $(sSelectorForm + ' .dropdown, ' + sSelectorForm + ' .imo-dropdown').removeClass('open')
      });
      $('a.sortare').click(function(event) {
          if ($('#sort-label').html() != $(this).html()) {
              $('a.sortare').removeClass('selected');
              $(this).addClass('selected');
              $('#sort-label').html($(this).html());
              $('body').trigger('aplica_rafinare')
          }
      });
      $('body').on('click', 'a.reset-filtre,#contor-total-js a', function(event) {
          event.preventDefault();
          $('.delete-rafinare').addClass('hidden-element');
          $('.grupa-principala-js, #buton_mai_multe').removeClass('yellow-filter');
          event.stopPropagation();
          LISTA_RAFINARE.resetFilters();
          $('body').trigger('aplica_rafinare', {
              'forced': true
          })
      });
      $('.btn-group-responsive .reset').on('click', function() {
          $(this).parent().find('.btn').not('.reset').each(function() {
              $(this).removeClass('active');
              $(this).find('input[type="checkbox"]').prop('checked', false);
              $('body').trigger('aplica_rafinare', {
                  'forced': true
              })
          })
      });
      $(sSelectorForm + ' input[type=checkbox]').on('change', function(e) {
          if ($(this).is('.btn-group-responsive .btn:not(.reset) [type=checkbox]')) {
              const $btns = $(this).closest('.btn-group').find('.btn');
              const $resetBtn = $btns.filter('.reset');
              const $otherBtns = $btns.filter(':not(.reset)');
              const isOthersSelected = $otherBtns.find(':checked').length;
              rafinareOpts = {
                  forced: true
              };
              if ($(this).is(":checked")) {
                  $(this).closest("label").addClass("active")
              } else {
                  $(this).closest("label").removeClass("active")
              }
              if (isOthersSelected) {
                  $resetBtn.removeClass('active').find('input').prop('checked', false)
              } else {
                  $resetBtn.addClass('active').find('input').prop('checked', true)
              }
          }
      });
      $(sSelectorForm + ' .btn-group-responsive .reset').on('click', function(e) {
          if (this.classList.contains('active')) {
              return false
          }
          $(this).addClass('active').siblings().removeClass('active').find('input').prop('checked', false)
      })
  }
  ;function valideazaSelecturiPereche(oContainer) {
      var twoSelects = oContainer.find('select');
      if (typeof (twoSelects[0]) == 'undefined' || typeof (twoSelects[1]) == 'undefined') {
          return
      }
      ;var value1 = $(twoSelects[0]).val();
      var value2 = $(twoSelects[1]).val();
      if (value1 == '' || value2 == '') {
          return
      }
      if (parseInt(value1) > parseInt(value2)) {
          $(twoSelects[0]).val(value2);
          $(twoSelects[0]).selectpicker("refresh");
          $(twoSelects[1]).val(value1);
          $(twoSelects[1]).selectpicker("refresh")
      }
  }
  return {
      init: function() {
          initialState.checkboxes = {};
          initialState.radio = {};
          initialState.inputsText = {};
          initialState.selectboxes = {};
          initialState.filtre = {};
          initialState.content = LISTA_RAFINARE.getObjListaRezultate().html();
          initialState.content_extins = LISTA_RAFINARE.getObjListaRezultateExtinse().html();
          initialState.aDetaliiTitlu = {
              titlu_lung: document.title,
              titlu: $('#titlu_anunturi_js').html()
          };
          initialState.contor = $('#buton_mai_multe .counter').text().replace(/[^0-9]/g, '');
          initialState.contorTotal = 0;
          initialState.localizare = $('#localizare_autocomplete').val();
          initialState.total = $('.total_anunturi_js').html();
          if ($('.total_anunturi_mobile_js').length) {
              initialState.iTotalAnunturi = $('.total_anunturi_mobile_js').html().replace(/[^0-9]/g, '')
          }
          $('.grupa-principala-js').each(function() {
              initialState.filtre[$(this).attr('rel')] = $(this).text()
          });
          $(sSelectorForm + " input:checkbox" + ", input.shortcut-raf").each(function() {
              initialState.checkboxes[$(this).attr('id')] = $(this).prop('checked')
          });
          $(sSelectorForm + " input:radio").each(function() {
              initialState.radio[$(this).attr('id')] = $(this).attr('checked')
          });
          $(sSelectorForm).find('input:text,input[type="tel"]').each(function() {
              initialState.inputsText[$(this).attr('id')] = $(this).val()
          });
          $(sSelectorForm + " select").each(function() {
              initialState.selectboxes[$(this).attr('id')] = $(this).val()
          });
          initialState.sortare = $('#sort-label').html();
          initialState.url = $('#buton_lista_js').prop('href');
          initialState.urlHarta = $('#buton_harta_js').prop('href');
          initialState.bModHarta = bModHarta;
          initialState.poligon = $.trim($('#poligon-js').val());
          initialState.iIdCautare = $('#idCautare').val();
          initialState.bCautareSalvata = $('.buton-salveaza-cautare').hasClass('cautare-salvata') ? 1 : 0;
          initialState.loglista = $('#idCautare').data('log');
          rafineazaMultiplu()
      },
      stergeFiltreCategorie: function(deleteButton) {
          var dropdown = $(deleteButton).parent();
          dropdown.find('li.checked').removeClass('checked').find('input:checkbox').prop('checked', false);
          dropdown.find('li.custom-container input[type=tel], select').val('default');
          dropdown.find('li.custom-container input[type=tel], select').selectpicker("refresh");
          dropdown.find('input[type=radio]').not('.default').prop('checked', false);
          dropdown.find('input[type=radio].default').prop('checked', true);
          if (dropdown.find('.locuinte_noi_compuse').length) {
              $('#shortcut_locuinte_noi').prop('checked', false).parent().removeClass('checked')
          }
          $(deleteButton).addClass('hidden-element');
          dropdown.find('.grupa-principala-js').removeClass('yellow-filter');
          $('body').trigger('aplica_rafinare', {
              'forced': true
          })
      },
      stergeFiltreCopil: function(deleteButton) {
          var parent = $(deleteButton).closest('.form_filtre');
          var containerFiltruIntervalFrom = parent.find('.selectpicker_wp.from');
          var containerFiltruIntervalTo = parent.find('.selectpicker_wp.to');
          var deleteRafinareFrom = containerFiltruIntervalFrom.find('.delete-rafinare');
          var deleteRafinareTo = containerFiltruIntervalTo.find('.delete-rafinare');
          deleteRafinareFrom.addClass('hidden-element');
          deleteRafinareTo.addClass('hidden-element');
          $(parent).find('.reset').trigger('click')
      },
      stergeFiltreCategorieMaiMulte: function() {
          var maiMulteContainer = $('.imo-dropdown-menu');
          maiMulteContainer.find('.dropdown').each(function() {
              var dropdown = $(this);
              dropdown.find('li.checked').removeClass('checked').find('input:checkbox').prop('checked', false);
              dropdown.find('li.custom-container select').val('').prop('disabled', false);
              dropdown.find('li.custom-container .two-select-boxes').removeClass('disabled');
              dropdown.find('.delete-rafinare').addClass('hidden-element');
              dropdown.find('.grupa-principala-js').removeClass('yellow-filter').removeClass('disabled')
          });
          maiMulteContainer.find('input:radio').each(function() {
              var defaultValue = $(this).parent().parent().find('input.default').val();
              if (typeof (defaultValue) != 'undefined' && $(this).prop('value') == defaultValue) {
                  $(this).prop('checked', 'checked');
                  $(this).parent('li').addClass('checked')
              } else {
                  $(this).attr('checked', false);
                  $(this).parent().removeClass('checked')
              }
          });
          $('.custom-raf').removeClass('checked');
          $('.custom-raf input[type=checkbox]').checked('checked', false);
          $('#searchCriteria').val('');
          $('.delete-custom .delete-rafinare').addClass('hidden-element');
          $('body').trigger('aplica_rafinare', {
              'forced': true
          })
      },
      reseteazaCampuriCustomSauCampuriPredefinite: function(dropdown) {
          if (bRafinareCustom) {
              dropdown.find('li.checked').removeClass('checked').find('input:checkbox').prop('checked', false)
          } else {
              dropdown.find('li.custom-container input[type=tel], select').val('default');
              dropdown.find('li.custom-container input[type=tel], select').selectpicker("refresh")
          }
      },
      afiseazaButonInchidereDropdown: function(dropdown) {
          var found = false;
          if (dropdown.hasClass('hidden')) {
              return
          }
          dropdown.find('input:checkbox').each(function() {
              if ($(this).prop('checked') == true) {
                  found = true
              }
          });
          dropdown.find('input:radio').each(function() {
              var defaultValue = $(this).parent().parent().find('input.default').val();
              if (typeof (defaultValue) != 'undefined' && $(this).is(":checked") && $(this).prop('value') != defaultValue) {
                  found = true
              }
          });
          dropdown.find('li.custom-container input[type=tel], select').not('.error').each(function() {
              if ($(this).val() != '') {
                  found = true
              }
          });
          var oParent = dropdown.hasClass('dropdown-menu') ? dropdown.parent() : dropdown;
          if (found) {
              oParent.find('span.delete-rafinare').removeClass('hidden-element');
              oParent.find('.grupa-principala-js').addClass('yellow-filter')
          } else {
              oParent.find('span.delete-rafinare').addClass('hidden-element');
              oParent.find('.grupa-principala-js').removeClass('yellow-filter')
          }
      },
      restoreFilters: function(restoreObject) {
          if (typeof (restoreObject.checkboxes) != 'undefined') {
              $.each(restoreObject.inputsText, function(index) {
                  $('#' + index).val(restoreObject.inputsText[index])
              });
              $.each(restoreObject.checkboxes, function(index) {
                  var targetElement = $('#' + index);
                  var dropdown = targetElement.parents('.dropdown-menu');
                  if (restoreObject.checkboxes[index] == 'checked') {
                      targetElement.prop('checked', true);
                      targetElement.closest('li').addClass('checked');
                      targetElement.closest('label.btn').addClass('active')
                  } else {
                      targetElement.prop('checked', false);
                      targetElement.closest('li').removeClass('checked');
                      targetElement.closest('label.btn').removeClass('active')
                  }
                  if (dropdown.length) {
                      LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
                  }
              });
              $.each(restoreObject.radio, function(index) {
                  var targetElement = $('#' + index);
                  var dropdown = targetElement.parents('.dropdown-menu');
                  if (restoreObject.radio[index] == 'checked') {
                      targetElement.prop('checked', true);
                      targetElement.closest('li').addClass('checked')
                  } else {
                      targetElement.prop('checked', false);
                      targetElement.closest('li').removeClass('checked')
                  }
                  if (dropdown.length) {
                      LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
                  }
              });
              $.each(restoreObject.selectboxes, function(index) {
                  var targetElement = $('#' + index);
                  var dropdown = targetElement.parents('.dropdown-menu');
                  targetElement.val(restoreObject.selectboxes[index]);
                  if (dropdown.length) {
                      LISTA_RAFINARE.afiseazaButonInchidereDropdown(dropdown)
                  }
              })
          }
          modificaTitluFiltrePrincipale(restoreObject);
          modificaFiltreMaiMulte(restoreObject);
          modificaDependinteFiltruLocuinteNoi(restoreObject);
          modificaBreadcrumb(restoreObject);
          modificaAgentii(restoreObject);
          modificaVariabileBannere(restoreObject);
          modificaVariabilagGaFakePage(restoreObject);
          modificaVariabileIag(restoreObject)
      },
      getObjSuperListaRezultate: function() {
          return $(sSelectorSuperListaRezultate)
      },
      getObjListaRezultate: function() {
          return $(sSelectorListaRezultate)
      },
      getObjListaRezultateExtinse: function() {
          return $(sSelectorListaRezultateExtinse)
      },
      getObjListaPP: function() {
          return $(sSelectorListaPP)
      },
      showHideFiltreLicitatii: function() {
          if ($(".executari-silite-checkbox").is(":checked")) {
              $("div.grupe-secundare-licitatii").removeClass('hidden')
          } else {
              $("div.grupe-secundare-licitatii").addClass('hidden').find('.grupa-principala-js').removeClass('yellow-filter');
              $("div.grupe-secundare-licitatii").find('.delete-rafinare').addClass('hidden')
          }
      },
      reseteazaFiltreCompuseLicitatii: function() {
          $("div.grupe-secundare-licitatii").each(function() {
              $(this).find('input[type="radio"]').each(function() {
                  if ($(this).is(":checked") && $(this).hasClass('default')) {
                      return false
                  } else if ($(this).is(":checked") && $(this).hasClass('default') === false) {
                      $(this).prop('checked', false);
                      $(this).parent().removeClass("checked")
                  } else if ($(this).is(":checked") === false && $(this).hasClass('default')) {
                      $(this).prop('checked', true);
                      $(this).parent().addClass("checked")
                  }
              })
          })
      },
      showHideResetFilters: function(bDomready) {
          var found = false;
          $(sSelectorForm + " input:checkbox").each(function() {
              if ($(this).prop('checked') == 'checked' || $(this).closest('li').hasClass("checked") || $(this).closest('label:not(.reset)').hasClass("active")) {
                  found = true
              }
          });
          $(sSelectorForm + " input:radio").each(function() {
              if (!$(this).hasClass('default') && $(this).prop('checked') == true) {
                  found = true
              }
          });
          $(sSelectorForm).find('input:text,input[type="tel"]').not('.error').each(function() {
              if ($(this).val() != '') {
                  found = true
              }
          });
          $(sSelectorForm + " select").each(function() {
              var defaultValue = $(this).find('option.default').val();
              if ((typeof (defaultValue) != 'undefined' && $(this).val() != $(this).find('option.default').val()) || (typeof (defaultValue) == 'undefined' && $(this).val() != '' && typeof $(this).val() != 'undefined' && $(this).val() != null)) {
                  found = true
              }
          });
          if (found) {
              $("#reset-filters-container").removeClass('hidden').removeClass('disabled');
              $("#reset-filters-container").find('.tip-buton--disabled').removeClass('tip-buton--disabled')
          } else if (typeof bDomready == 'undefined' || !bDomready) {
              $("#reset-filters-container").addClass('hidden')
          }
      },
      resetFilters: function() {
          $(sSelectorForm + " input:checkbox" + ", input.shortcut-raf").each(function() {
              var btnGroup = $(this).parent().parent();
              if (btnGroup.attr("data-filtru") == "executari_silite") {
                  return true
              }
              $(this).prop('checked', false);
              $(this).parent().removeClass('checked');
              if (btnGroup.hasClass('btn-group-responsive')) {
                  btnGroup.find('.btn.reset').addClass('active');
                  btnGroup.find('.btn').not('.reset').removeClass('active')
              } else if (btnGroup.hasClass('tags-responsive')) {
                  btnGroup.find('.btn').removeClass('active')
              }
          });
          $(sSelectorForm + " input:radio").each(function() {
              var defaultValue = $(this).parent().parent().find('input.default').val();
              if (defaultValue != 'undefined' && $(this).prop('value') == defaultValue) {
                  $(this).prop('checked', 'checked');
                  $(this).parent('li').addClass('checked')
              } else {
                  $(this).attr('checked', false);
                  $(this).parent().removeClass('checked')
              }
          });
          $(sSelectorForm).find('input:text,input[type="tel"]').each(function() {
              $(this).val('')
          });
          $(sSelectorForm + " select").each(function() {
              var containerFiltruInterval = $(this).parents(':eq(1)');
              var dropdownToggle = $(this).parents('.dropdown').find('.dropdown-toggle');
              $(this).prop('disabled', false);
              if ($(this).find('option.default').length) {
                  $(this).val($(this).find('option.default').val())
              } else {
                  $(this).val('default');
                  $(this).selectpicker("refresh")
              }
              containerFiltruInterval.removeClass('disabled');
              dropdownToggle.removeClass('disabled')
          });
          if ($('a.sortare.selected').attr('data-val') != 'tl-none') {
              $('a.sortare').removeClass('selected');
              $('a.sortare.default').addClass('selected');
              $('#sort-label').html($('a.sortare.default').html())
          }
      },
      reverseOnclickAttrCautareSalvata: function(elements) {
          elements.each(function() {
              var attr = $(this).attr('onclick');
              if (!attr) {
                  return
              }
              if (attr.indexOf('test_afisari_lista') !== -1) {
                  if (attr.indexOf('salveaza_cautare_') !== -1) {
                      newAttr = attr.replace('salveaza_cautare_', 'cautare_salvata_')
                  } else {
                      newAttr = attr.replace('cautare_salvata_', 'salveaza_cautare_')
                  }
                  $(this).removeAttr('onclick').attr('onclick', newAttr)
              }
          })
      },
      cautareSalvata: function(response) {
          if (response.bCautareSalvata > 0) {
              var text = 'C&#259;utare salvat&#259;';
              $(".buton-salveaza-cautare,.buton-salveaza-cautare-nelogat").addClass('cautare-salvata');
              $("body").trigger('dezactiveazaExitModal');
              LISTA_RAFINARE.reverseOnclickAttrCautareSalvata($(".buton-salveaza-cautare,.buton-salveaza-cautare-nelogat"))
          } else {
              var text = 'Salveaz&#259; c&#259;utarea';
              $(".buton-salveaza-cautare,.buton-salveaza-cautare-nelogat").removeClass('cautare-salvata');
              if (typeof (response.sNumeExitModal) != 'undefined' && response.sNumeExitModal != '') {
                  $('#modal-exit-' + response.sNumeExitModal + ' .nume-imoagent-propus').html(response.aDetaliiTitlu.nume_iag[0]);
                  $('#modal-exit-' + response.sNumeExitModal + ' .descriere-imoagent-propus').html(response.aDetaliiTitlu.nume_iag[1]);
                  $("body").trigger('activeazaExitModal', [response.sNumeExitModal])
              }
              LISTA_RAFINARE.reverseOnclickAttrCautareSalvata($(".buton-salveaza-cautare,.buton-salveaza-cautare-nelogat"))
          }
          $(".buton-salveaza-cautare,.buton-salveaza-cautare-nelogat").find("span").html(text)
      },
      propuneImoagent: function(response) {
          if (typeof (response.bPropunereImoagent) != 'undefined') {
              $('#idCautare').data('imoagent', response.bPropunereImoagent ? 1 : 0)
          }
      },
      actualizeazaLogData: function(response) {
          if (typeof (response.loglista) != 'undefined') {
              $('#idCautare').data('log', response.loglista)
          }
      },
      actualizeazaCarouselAnsambluri: function(response) {
          if (typeof (response.sHtmlCarouselAnsambluri) != 'undefined') {
              bLogAnsambluri = false;
              $('#container-carousel-ansambluri').html(response.sHtmlCarouselAnsambluri)
          }
      },
      fetchAnunturiRecomandate: function() {
          if (recomandateResponseData) {
              this.desenareRecomandateLista()
          } else {
              var $boxuriAnunturi = $('.box-anunt,#container-oferte-promovate [data-id-cod]').not('.proiect');
              var aExcludeOferte = [];
              $boxuriAnunturi.each(function() {
                  if (typeof $(this).attr('data-id-cod') != 'undefined') {
                      aExcludeOferte.push($(this).attr('data-id-cod'))
                  }
              });
              var data = {
                  'id_cautare': $('#idCautare').val(),
                  'exclude_oferte': aExcludeOferte.join(','),
                  'listaExstinsa': typeof listaExstinsa !== "undefined" ? listaExstinsa : 0
              };
              $.ajax({
                  type: 'POST',
                  dataType: 'json',
                  data: data,
                  url: '/oferte-recomandate-lista',
                  success: function(response) {
                      recomandateResponseData = response;
                      LISTA_RAFINARE.desenareRecomandateLista()
                  }
              })
          }
      },
      desenareRecomandateLista: function() {
          if (recomandateResponseData.html) {
              $('.js-placeholder-anunturi-recomandate').first().html(recomandateResponseData.html)
          }
          if (recomandateResponseData.sHtmlTop) {
              $('.js-placeholder-anunturi-recomandate-top').first().append(recomandateResponseData.sHtmlTop);
              dataLayerBoxOfertaObj.pushInDataLayerImpressions($("#b_poleposition_wrapper ul > li.recomandate-top"), -1, 'pole position');
              var scroller = $('#scroller').width();
              $('#scroller').width(191 * 4 + scroller);
              $('#thumbnails_responsive').removeClass('no-scroll').addClass('scroll');
              if (typeof (caruselPolePosition) == 'object') {
                  caruselPolePosition.destroy()
              }
              caruselPolePosition = ThumbnailScroller('thumbnails_responsive', {
                  nrThumbsAfisate: 4,
                  eventOnScroll: true,
                  mouseWheel: false,
                  eventPassthrough: true,
                  scrollbars: true,
              })
          }
      },
      paginare: function(url, pagina) {
          timingStartPaginare = new Date().getTime();
          var oPost = {
              cautare: $('#idCautare').val(),
              pagina: pagina
          };
          var oUrl = get_url_params(url);
          if (typeof (oUrl.start) != 'undefined' && typeof (oUrl.end) != 'undefined') {
              oPost['start'] = oUrl.start;
              oPost['end'] = oUrl.end
          }
          if (typeof (oUrl.start) != 'undefined' && typeof (oUrl.stop) != 'undefined') {
              oPost['start'] = oUrl.start;
              oPost['stop'] = oUrl.stop
          }
          HARTA_PAGINARE.preloadList(true);
          if ($("#titlu_lista").length) {
              $("html, body").scrollTop(0)
          }
          ;let sUrl = 'lista/paginare';
          $('body').trigger('clearTimerLog');
          xhr = $.post(aTexte.general.sPortalUrl + sUrl, oPost).done(function(response) {
              timingRaspunsPaginare = new Date().getTime() - timingStartPaginare;
              response = $.parseJSON(response);
              trackExperimenteRaspunsAjax(response);
              aTexte.lista.iPaginaCurenta = pagina - 1;
              aTexte.lista.iNrAnunturiPagina = response.iNrAnunturiPagina;
              if (typeof response.anunturiPromo !== "undefined") {
                  aTexte.lista.anunturiPromo = response.anunturiPromo
              }
              HARTA_PAGINARE.populateList(response.content, false, true);
              LISTA_RAFINARE.getObjListaRezultate().html(response.content);
              LISTA_RAFINARE.propuneImoagent(response);
              LISTA_RAFINARE.actualizeazaLogData(response);
              var oldState = null;
              if (window.history.state != null) {
                  oldState = window.history.state
              } else {
                  oldState = initialState
              }
              response = $.extend({}, oldState, response);
              $('body').trigger('reloadBanners').trigger('reloadPropuneImoagent').trigger('resetHeightImagini');
              logAfisariTimer = setTimeout(function() {
                  $('body').trigger('reloadPolePosition').trigger('reloadLogAfisari').trigger('reloadLogAfisariViewport')
              }, logAfisariTimerMilliseconds);
              LISTA_RAFINARE.updateTitleAndMeta(response);
              currentUrlLista = url;
              window.history.pushState(response, document.title, url);
              $('body').trigger('reloadAnalytics').trigger('repaintLista');
              updateReferrer(document.URL);
              LISTA_RAFINARE.actualizeazaCarouselAnsambluri(response);
              LISTA_RAFINARE.fetchAnunturiRecomandate();
              pushAfisariAnunturiLista();
              HARTA_UTILS.trimiteEventClickAnunt();
              if (typeof (RtbHouse) != 'undefined') {
                  $('body').trigger('reloadRtbHouseIframe', ['category', {
                      sNumeCategorie: response.sNumeCategorieDedicatRTB
                  }])
              }
              $('body').trigger('endPaginare')
          })
      },
      butoaneHartaLista: function(response) {
          if (typeof (response.url) != 'undefined') {
              $('#buton_lista_js').prop('href', response.url);
              $('#buton_harta_js').prop('href', response.urlHarta)
          }
      },
      updateTitleAndMeta: function(dataObj) {
          document.title = html_entity_decode(dataObj.aDetaliiTitlu.titlu_lung) + " - Imobiliare.ro";
          if (dataObj.sMetaDescription != undefined && dataObj.sMetaDescription.length > 0) {
              var text = dataObj.sMetaDescription;
              if (text.indexOf('&#x1F3E1') !== -1) {
                  text = text.replace(/&#x1F3E1/g, String.fromCodePoint(0x1F3E1))
              }
              $('meta[name=Description]').attr('content', text)
          }
          if (dataObj.sH1 != undefined && dataObj.sH1.length > 0) {
              $('p.footer_lista_first_p').html(dataObj.sH1)
          }
          if (dataObj.sCustomText1 != undefined && dataObj.sCustomText1.length > 0) {
              $('p.footer_lista_second_p').html(dataObj.sCustomText1)
          }
      },
      seteazaModAfisare: function(response) {
          if (typeof (response.bModHarta) != 'undefined') {
              if (response.bModHarta) {
                  $('body').trigger('reloadHarta', response)
              }
              if (!response.bModHarta && bModHarta) {
                  $('body').trigger('destroyHarta')
              }
          }
      },
      trimiteProfilSearchDataLayer: function(response) {
          if (typeof response.iIdCautare !== "undefined") {
              $('body').trigger('reloadUserSearchProfile', ['lista', {
                  iIdCautare: response.iIdCautare
              }])
          }
      }
  }
}();
