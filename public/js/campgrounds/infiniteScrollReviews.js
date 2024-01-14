const container = document.querySelector(".reviews-container")
const loader = document.querySelector(".loader")
let endMessageIsShown = false
// currentUser=JSON.parse(currentUser)
// campground=JSON.parse(campground)

//******************************
//IFINITE SCROLL WITHOUT BUTTON
//******************************
window.addEventListener("scroll", async () => {
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) {
        const nextPage = currentPage + 1
        currentPage++
        await loadReviews(nextPage)
    }
})

// ******************************
// IFINITE SCROLL USING BUTTON
// ******************************
// loader.addEventListener("click", async () => {
//     const nextPage = currentPage + 1
//     currentPage++
//     if (currentPage >= totalPages) {
//         loader.remove()
//     }
//     await loadReviews(nextPage)
// })

async function loadReviews(nextPage) {
    const response = await axios.get("http://localhost:3000/campgrounds/64dbeb80f65feb4a6a37b684/reviews/api", {
        params: {
            page: nextPage
        }
    })
    const reviews = response.data
    if (reviews.length > 0) {
        reviews.forEach((review) => {
            const reviewElt = createReviewElt(review)
            container.appendChild(reviewElt)
        })
    } else if (!endMessageIsShown) {
        endMessageIsShown = true
        const flashMessageElt = document.createElement("div")
        flashMessageElt.innerText = "no more reviews"
        container.insertAdjacentElement("afterend", flashMessageElt)
    }
}

function createReviewElt(review) {
    const reviewElt = document.createElement("div")
    reviewElt.className = "card-body p-4 border-bottom"
    reviewElt.innerHTML = reviewEltTemplate
        .replace("<%= review.owner.username %>", review.owner.username)
        .replace("<%= review.rating %>", review.rating)
        .replace("<%= review.text %>", review.text)
    if (currentUser && currentUser._id == review.owner._id) {
        const deleteForm = createDeleteFormElt(review)
        reviewElt.appendChild(deleteForm)
    }
    return (reviewElt)
}

const createDeleteFormElt = (review) => {
    const deleteForm = document.createElement("form")
    deleteForm.setAttribute("action", `/campgrounds/${campground._id}/reviews/${review._id}?_method=DELETE`)
    deleteForm.setAttribute("method", "POST")
    const deleteButton = document.createElement("button")
    deleteButton.className = "btn btn-danger"
    deleteButton.innerText = "Delete"
    deleteForm.appendChild(deleteButton)
    return (deleteForm)
}

const reviewEltTemplate = `
    <div class="d-flex flex-start">
        <img class="rounded-circle shadow-1-strong me-3"
            src="https://loremflickr.com/640/480/nature?lock=814018635759616" alt="avatar"
            width="60" height="60" />
        <div>
            <h6 class="fw-bold mb-1"><%= review.owner.username %></h6>
            <div>
                <p class="mb-0">
                    March 07, 2021
                </p>
                <p class="starability-result mb-0" data-rating="<%= review.rating %>">
                    Rated: <%= review.rating %> stars
                </p>
            </div>
            <p class="mb-0">
                <%= review.text %>
            </p>
        </div>
    </div>
    `
