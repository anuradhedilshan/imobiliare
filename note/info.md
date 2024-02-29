# Deverloper Notes

### Tech stack

- React (FrontEnd)
- Typescript + Javascript
- Electron JS

## Tasks

[x] Ui Developtment

### notes

```
iSubcategorie:107
date_cautator[b_cautare_tranzactie_val]: 2
date_cautator[b_cautator_categorie_radio]:107
```

#### catagory

```html
<select
  class="yellow-filter-with-arrow selectpicker imo-select extra-lat desktop form-control form-control--localizare"
  data-val="107"
  name="b_cautator_categorie_radio"
  id="b_cautator_categorie_radio"
  autocomplete="off"
  tabindex="null"
>
  <option value="0" class="strong">Toate</option>
  <option value="101" class="strong">Apartamente</option>
  <option value="104" class="subitem">&nbsp;&nbsp;&nbsp;Garsoniere</option>
  <option value="102" class="strong" selected="selected">Case / Vile</option>

  <option value="107" class="subitem" selected="selected">
    &nbsp;&nbsp;&nbsp;Individuale
  </option>
  <option value="106" class="subitem">&nbsp;&nbsp;&nbsp;Duplexuri</option>

  <option value="202" class="strong">Spaţii comerciale</option>
  <option value="201" data-disable="vanzari">&nbsp;&nbsp;&nbsp;Birouri</option>
</select>
```

### CallStack

1.  updateDateLocalizare
1.  proceseazaSelectieCauta
1.  selectItem
1.  slocalizat

## OverideSCript

<code>
window.updateDateLocalizare = (localizare) => {console.log(localizare)
    let oPost = obtineDatePentruFiltrare(true);
    oPost['b_cautator_locatie_id'] = $("#b_cautator_locatie_id").val();
    oPost['localizare'] = localizare;
    $.post(aTexte.general.sPortalUrl + 'lista/raf-multiplu', oPost, response=>{
        let url = response.url.replace(/^\//g, '');
        if (url.indexOf(aTexte.general.sPortalUrl) === false) {
            url = aTexte.general.sPortalUrl + url
        }
        console.log(url);
    }
    , 'json')
} 
</code>


