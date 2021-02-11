const BASE_URL = "https://api.harvardartmuseums.org";
const KEY = "apikey=eaeb5b7e-aefa-4d3e-b318-30e168432ce9"; // USE YOUR KEY HERE

async function fetchObjects() {
  const url = `${BASE_URL}/object?${KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  }
  function onFetchStart() {
    $("#loading").addClass("active");
  }

  function onFetchEnd() {
    $("#loading").removeClass("active");
  }
}
// fetch(url)
//     .then(function (response) {
//         return response.json()
//     })
//     .then(function (response) {
//         console.log(response);
//     })
//     .catch(function (error) {
//         console.error(error);
//     });

fetchObjects().then((x) => console.log(x));
fetchAllCenturies();
fetchAllCenturies();

async function fetchAllCenturies() {
  const url = `${BASE_URL}/century?${KEY}&size=100&sort=temporalorder`;
  if (localStorage.getItem("centuries")) {
    // console.log('Im not doing it')
    return JSON.parse(localStorage.getItem("centuries"));
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;
    localStorage.setItem("centuries", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
}

async function fetchAllClassifications() {
  const url = `${BASE_URL}/classification?${KEY}&size=100&sort=name`;
  if (localStorage.getItem("classifications")) {
    return JSON.parse(localStorage.getItem("classifications"));
  }
  try {
    const response = await fetch(url);
    const data = await response.json();
    const records = data.records;
    localStorage.setItem("classifications", JSON.stringify(records));
    return records;
  } catch (error) {
    console.error(error);
  }
  function onFetchStart() {
    $("#loading").addClass("active");
  }

  function onFetchEnd() {
    $("#loading").removeClass("active");
  }
}

async function prefetchCategoryLists() {
  try {
    const [classifications, centuries] = await Promise.all([
      fetchAllClassifications(),
      fetchAllCenturies(),
    ]);

    $(".classification-count").text(`(${classifications.length})`);

    classifications.forEach((classification) => {
      let option = $(
        `<option value="${classification.name}">${classification.name}</option>`
      );
      $("#select-classification").append(option); // append a correctly formatted option tag into
      // the element with id select-classification
    });

    // This provides a clue to the user, that there are items in the dropdown
    $(".century-count").text(`(${centuries.length})`);

    centuries.forEach((century) => {
      let option = $(
        `<option value="${century.name}">${century.name}</option>`
      );
      $("#select-century").append(option); // append a correctly formatted option tag into
      // the element with id select-century
    });
  } catch (error) {
    console.error(error);
  }
  function onFetchStart() {
    $("#loading").addClass("active");
  }

  function onFetchEnd() {
    $("#loading").removeClass("active");
  }
}

prefetchCategoryLists();

function buildSearchString() {
  let classification = $("#select-classification").val();
  let century = $("#select-century").val();
  let keywords = $("#keywords").val();
  const url = `${BASE_URL}/object?${KEY}&classification=${classification}&century=${century}&keyword=${keywords}`;

  return url;
}

$("#search").on("submit", async function (event) {
  console.log("clicked");
  event.preventDefault(); // prevent the default

  try {
    const url = buildSearchString(); // get the url from `buildSearchString`
    const response = await fetch(url); // fetch it with await, store the result
    const data = await response.json(); // log out both info and records when you get them
    console.log(data);
    updatePreview(data.records, data.info);
    return data;
  } catch (error) {
    console.error(error); // log out the error
  }
});

async function someFetchFunction() {
  onFetchStart();

  try {
    await fetch();
  } catch (error) {
    // error stuff
  } finally {
    onFetchEnd();
  }
  function onFetchStart() {
    $("#loading").addClass("active");
  }

  function onFetchEnd() {
    $("#loading").removeClass("active");
  }
}

function renderPreview(record) {
  // grab description, primaryimageurl, and title from the record

  const objectPreview = $(` <div class="object-preview">
  <a href="#">
  <img src="${record.primaryimageurl}" />
  <h3>${record.title}</h3>
  <h3>${record.description}</h3>
  </a>
  </div>`);
  /*
  
  Template looks like this:
    Some of the items might be undefined, if so... don't render them
  
    With the record attached as data, with key 'record'
    */
  objectPreview.data("record", record);
  return objectPreview; // return new element
}

function updatePreview(records, info) {
  const root = $("#preview");
  if (info.next) {
    $(".next button").data("url", info.next);
    $(".next button").attr("disabled", false);
  } else {
    $(".next button").data(null);
    $(".next button").attr("disabled", true);
  }
  if (info.prev) {
    $(".prev button").data("url", info.prev);
    $(".prev button").attr("disabled", false);
  } else {
    $(".prev button").data(null);
    $(".prev button").attr("disabled", true);
  }
  $(".results").empty();
  records.forEach((record) => {
    $(".results").append(renderPreview(record));
  });
}

$("#preview .next, #preview .previous").on("click", async function () {
  const url = `${BASE_URL}/object?${KEY}`;
  try {
    const response = await fetch(url);
    const data = await response.json();

    return data;
  } catch (error) {
    console.error(error);
  } finally {
    url = `${BASE_URL}/object?${KEY}`;
  }
  /*
    read off url from the target 
    fetch the url
    read the records and info from the response.json()
    update the preview
    */
});
function onFetchStart() {
  $("#loading").addClass("active");
}

function onFetchEnd() {
  $("#loading").removeClass("active");
}

$("#preview").on("click", ".object-preview", function (event) {
  // they're anchor tags, so don't follow the link
  event.preventDefault();
  // find the '.object-preview' element by using .closest() from the target
  let closest = $(event.target).closest(".object-preview");
  // recover the record from the element using the .data('record') we attached
  let record = $(closest).data("record");
  // log out the record object to see the shape of the data
  console.log(record);
  $("#feature").html(renderFeature(record));
  // renderFeature(record);
});

function renderFeature(record) {
  /** // build and return template
   * We need to read, from record, the following:
   * HEADER: title, dated
   * FACTS: description, culture, style, technique, medium, dimensions, people, department, division, contact, creditline
   * PHOTOS: images, primaryimageurl
   */

  return $(`<div class="object-feature">
  <header>
    <h3>${record.title}</h3>
    <h4>${record.dated}</h4>
  </header>
  <section class="facts">
  ${factHTML("Culture", record.culture, "culture")}
  ${factHTML("Style", record.style)}
  ${factHTML("Technique", record.technique, "technique")}
  ${factHTML("Medium", record.medium, "medium")}
  ${factHTML("Dimensions", record.dimensions)}
  ${factHTML("Department", record.department)}
  ${factHTML("Division", record.division)}
  ${factHTML("Contact", record.contact)}
  ${factHTML("Creditline", record.creditline)}
  
  ${
    record.people
      ? record.people
          .map((person) => {
            console.log(person);
            return factHTML("Person", person.displayname, "person");
          })
          .join("")
      : ""
  }

  </section>
  <section class="photos">
  ${photosHTML(record.images, record.primaryimageurl)}
  </section>
</div>`);
}

function searchURL(searchType, searchString) {
  return `${BASE_URL}/object?${KEY}&${searchType}=${searchString}`;
}

function factHTML(title, content, searchTerm = null) {
  if (!content) {
    // if content is empty or undefined, return an empty string ''
    return "";
  } else if (!searchTerm) {
    // otherwise, if there is no searchTerm, return the two spans
    return `<span class="title">${title}</span>
        <span class="content">${content}</span>`;
  } else {
    // otherwise, return the two spans, with the content wrapped in an anchor tag
    return `<span class="title">${title}</span>
        <span class="content"><a href="${searchURL(
          content,
          searchTerm
        )}"}>${content}</a></span>`;
  }
}

function photosHTML(images, primaryimageurl) {
  if (images && images.length > 0) {
    // if images is defined AND images.length > 0, map the images to the correct image tags, then join them into a single string.  the images have a property called baseimageurl, use that as the value for src
    images.map((image) =>
      $(`<div>
        <img src='${image.basedimageurl}' />
        </div>`)
    );
  } else if (primaryimageurl) {
    // else if primaryimageurl is defined, return a single image tag with that as value for src
    return $(`<div>
    <img src='${image.primaryimageurl}' />
    </div>`);
  } else {
    // else we have nothing, so return the empty string
    return "";
  }
}

$("#feature").on("click", "a", async function (event) {
  const href = $(this).attr("href"); // read href off of $(this) with the .attr() method
  if (href.startsWith('mailto')) { return; }
  event.preventDefault(); // prevent default

  onFetchStart(); // call onFetchStart
  // fetch the href
  try {
    const response = await fetch(href);
    const data = await response.json();
    // const records = data.records;
    console.log(data);
    renderPreview(data.records); // render it into the preview
  } catch (error) {
    console.error(error);
  }
  onFetchEnd(); // call onFetchEnd
});
