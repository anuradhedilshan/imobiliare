function aplicaRafinare(bLocalizare) {
  console.log("CAlling aplicaRafinare");
  timingStartRafinare = new Date().getTime();
  bLocalizare = typeof bLocalizare !== 'undefined' ? bLocalizare : false;
  if (bModHarta) {
    $('#map').append(
      '<div class="incarcare"><div id="loader_gif"></div></div>',
    );
  }
  HARTA_PAGINARE.preloadList(true);
  $('.icon-portal-refresh').addClass('rotate');
  $('.total_anunturi_mobile_js').hide();
  let oPost = obtineDatePentruFiltrare(bLocalizare);
  console.log(oPost, bLocalizare);
  $('body').trigger('clearTimerLog');
  xhr = $.post(aTexte.general.sPortalUrl + 'lista/raf-multiplu', oPost).done(
    function (response) {
      response = $.parseJSON(response);
      if (typeof response.redirectLista !== 'undefined') {
        let url = response.url.replace(/^\//g, '');
        if (url.indexOf(aTexte.general.sPortalUrl) === false) {
          url = aTexte.general.sPortalUrl + url;
        }
        window.location = url;
        return false;
      }
      trackExperimenteRaspunsAjax(response);
      aTexte.lista.idLista = response.iIdCautare;
      aDetaliiHarta = response.aDetaliiHarta;
      if (typeof response.anunturiPromo !== 'undefined') {
        aTexte.lista.anunturiPromo = response.anunturiPromo;
      }
      timingRaspunsRafinare = new Date().getTime() - timingStartRafinare;
      if (!liveReloadCompatible) {
        if (HASH_PROCESSOR.toString() != '') {
          window.location =
            aTexte.general.sPortalUrl +
            response.url.replace(/^\//g, '') +
            '#' +
            HASH_PROCESSOR.toString();
        } else {
          window.location =
            aTexte.general.sPortalUrl + response.url.replace(/^\//g, '');
        }
        return false;
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
      $(sSelectorForm + ' input:checkbox' + ', input.shortcut-raf').each(
        function () {
          response.checkboxes[$(this).attr('id')] = $(this).prop('checked');
        },
      );
      response.radio = {};
      $(sSelectorForm + ' input:radio').each(function () {
        response.radio[$(this).attr('id')] = $(this).attr('checked');
      });
      response.inputsText = {};
      $(sSelectorForm)
        .find('input:text,input[type="tel"]')
        .each(function () {
          response.inputsText[$(this).attr('id')] = $(this).val();
        });
      response.selectboxes = {};
      $(sSelectorForm + ' select').each(function () {
        response.selectboxes[$(this).attr('id')] = $(this).val();
      });
      response.sortare = $('#sort-label').html();
      response.cautator = CAUTARE.date_cautator || CAUTARE.obtineDateCautator();
      useLiveReloadResponse(response, bLocalizare);
      if (bModHarta) {
        $('body').trigger('reloadHarta', response).trigger('reloadAnalytics');
      } else {
        $('body')
          .trigger('reloadBanners')
          .trigger('reloadAnalytics')
          .trigger('resetHeightImagini')
          .trigger('repaintLista');
        logAfisariTimer = setTimeout(function () {
          $('body')
            .trigger('reloadPolePosition')
            .trigger('reloadLogAfisari')
            .trigger('reloadLogAfisariViewport');
        }, logAfisariTimerMilliseconds);
      }
      updateReferrer(document.URL);
      pushAfisariAnunturiLista();
      HARTA_UTILS.trimiteEventClickAnunt();
      if (typeof response.analytics != 'undefined') {
        completezaDateAnalytics(response.analytics);
      }
      if (
        typeof RtbHouse != 'undefined' &&
        typeof response.iIdCautare != 'undefined'
      ) {
        $('body').trigger('reloadRtbHouseIframe', [
          'category',
          {
            sNumeCategorie: response.sNumeCategorieDedicatRTB,
          },
        ]);
      }
      if (
        typeof response.iIdCautare !== 'undefined' &&
        typeof aTexte !== 'undefined' &&
        typeof aTexte.lista !== 'undefined'
      ) {
        aTexte.lista.idLista = response.iIdCautare;
      }
      LISTA_RAFINARE.trimiteProfilSearchDataLayer(response);
      LISTA_RAFINARE.fetchAnunturiRecomandate();
      $('body').trigger('endRafinare');
    },
  );
}
