let commentsData = [
  {
    id: 1,
    content: "This is the first comment!",
    upvotes: 5,
    downvotes: 2,
    replies: [
      {
        id: 11,
        content: "First subreply to the first comment!",
        upvotes: 3,
        downvotes: 1,
        replies: [
          {
            id: 111,
            content: "First sub-subreply to the first comment!",
            upvotes: 2,
            downvotes: 4,
            replies: []
          },
          {
            id: 112,
            content: "Second sub-subreply to the first comment!",
            upvotes: 1,
            downvotes: 0,
            replies: []
          }
        ]
      },
      {
        id: 12,
        content: "Second subreply to the first comment!",
        upvotes: 1,
        downvotes: 0,
        replies: []
      }
    ]
  },
  {
    id: 2,
    content: "This is the second comment!",
    upvotes: 2,
    downvotes: 1,
    replies: [
      {
        id: 21,
        content: "First subreply to the second comment!",
        upvotes: 0,
        downvotes: 1,
        replies: []
      }
    ]
  }
];
async function getWalletAddress() {
  if (window.ethereum) {
    try {
      await window.ethereum.enable();
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
      return null;
    }
  } else {
    console.error("MetaMask not found.");
    return null;
  }
}

// Function to update the votes count for a comment or reply
function updateVotesCount(element, votes) {
  const votesCount = element.querySelector(".votes-count");
  votesCount.textContent = votes;
}

// Function to display the user's address next to the votes when they comment
async function displayUserAddress(commentElement) {
  const address = await getWalletAddress();
  if (address) {
    const userElement = document.createElement("div");
    userElement.classList.add("user");
    userElement.textContent = `User Address: ${address}`;
    commentElement.insertBefore(userElement, commentElement.firstChild);
  }
}

// Function to render comments and subreplies
function renderComments(comments, parentElement) {
  parentElement.innerHTML='';
  for (let i = comments.length - 1; i >= 0; i--) {
    const comment = comments[i];
    const totalVotes = comment.upvotes - comment.downvotes;

    const commentElement = document.createElement("li");
    commentElement.classList.add("comment");
    commentElement.innerHTML = `
      <div class="votes">
        <button class="vote-btn upvote" data-vote="up"><img src="upvote.png" alt="Upvote"></button>
        <span class="votes-count">${totalVotes}</span>
        <button class="vote-btn downvote" data-vote="down"><img src="downvote.png" alt="Downvote"></button>
      </div>
      <div class="comment-content">${comment.content}</div>
      <button class="reply-btn">Reply</button>
      <button class="close-btn">Close</button>
      <div class="reply-dropdown">
        <textarea class="reply-input" placeholder="Write your reply here..."></textarea>
        <button class="submit-reply-btn">Submit Reply</button>
      </div>
      <ul class="replies"></ul>
      <button class="hide-replies-btn">Hide Replies</button>
      <button class="show-replies-btn">Show Replies</button>
    `;

    const voteBtns = commentElement.querySelectorAll(".vote-btn");
    voteBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const voteType = btn.dataset.vote;
        if (voteType === "up") {
          comment.upvotes++;
        } else if (voteType === "down") {
          comment.downvotes++;
        }

        updateVotesCount(commentElement, comment.upvotes - comment.downvotes);

        voteBtns.forEach((btn) => btn.classList.remove("upvoted", "downvoted"));
        if (comment.upvotes > comment.downvotes) {
          btn.classList.add("upvoted");
        } else if (comment.upvotes < comment.downvotes) {
          btn.classList.add("downvoted");
        }
      });
    });

    const replyBtn = commentElement.querySelector(".reply-btn");
    const closeBtn = commentElement.querySelector(".close-btn");
    const replyDropdown = commentElement.querySelector(".reply-dropdown");
    const replyInput = commentElement.querySelector(".reply-input");
    const submitReplyBtn = commentElement.querySelector(".submit-reply-btn");
    const repliesContainer = commentElement.querySelector(".replies");
    const showRepliesBtn = commentElement.querySelector(".show-replies-btn");
    const hideRepliesBtn = commentElement.querySelector(".hide-replies-btn");
    closeBtn.style.display = "none";

    replyBtn.addEventListener("click", () => {
      replyDropdown.style.display = "block";
      replyInput.style.display = "block";
      submitReplyBtn.style.display = "block";
      replyBtn.style.display = "none";
      closeBtn.style.display = "inline-block";
    });

    closeBtn.addEventListener("click", () => {
      replyDropdown.style.display = "none";
      replyInput.style.display = "none";
      submitReplyBtn.style.display = "none";
      replyBtn.style.display = "inline-block";
      closeBtn.style.display = "none";
    });

    submitReplyBtn.addEventListener("click", () => {
      const replyContent = replyInput.value;
      if (replyContent) {
        closeBtn.style.display = "none";
        comment.replies.push({
          id: Date.now(),
          content: replyContent,
          upvotes: 0,
          downvotes: 0,
          replies: []
        });
        replyInput.value = "";
        replyDropdown.style.display = "none";
        replyBtn.style.display = "inline-block";
        renderSubreplies(comment.replies, repliesContainer);
        repliesContainer.style.display = "block";
        hideRepliesBtn.style.display = "inline-block";
        showRepliesBtn.style.display = "none";
      }
    });

    hideRepliesBtn.addEventListener("click", () => {
      repliesContainer.style.display = "none";
      hideRepliesBtn.style.display = "none";
      showRepliesBtn.style.display = "inline-block";
    });

    showRepliesBtn.addEventListener("click", () => {
      repliesContainer.style.display = "block";
      hideRepliesBtn.style.display = "inline-block";
      showRepliesBtn.style.display = "none";
    });

    displayUserAddress(commentElement); // Display user address for the comment
    parentElement.appendChild(commentElement);
    renderSubreplies(comment.replies, repliesContainer);

    if (comment.replies.length > 0) {
      hideRepliesBtn.style.display = "inline-block";
      showRepliesBtn.style.display = "none";
    } else {
      hideRepliesBtn.style.display = "none";
      showRepliesBtn.style.display = "none";
    }
  }
}


function renderSubreplies(subreplies, parentElement) {
  parentElement.innerHTML='';
  for (let i = subreplies.length - 1; i >= 0; i--) {
    const subreply = subreplies[i];
    const totalVotes = subreply.upvotes - subreply.downvotes;

    const subreplyElement = document.createElement("li");
    subreplyElement.classList.add("comment");
    subreplyElement.innerHTML = `
      <div class="votes">
        <button class="vote-btn upvote" data-vote="up"><img src="upvote.png" alt="Upvote"></button>
        <span class="votes-count">${totalVotes}</span>
        <button class="vote-btn downvote" data-vote="down"><img src="downvote.png" alt="Downvote"></button>
      </div>
      <div class="comment-content">${subreply.content}</div>
      <button class="reply-btn">Reply</button>
      <button class="close-btn">Close</button>
      <div class="reply-dropdown">
        <textarea class="reply-input" placeholder="Write your reply here..."></textarea>
        <button class="submit-reply-btn">Submit Reply</button>
      </div>
      <ul class="replies"></ul>
      <button class="hide-replies-btn">Hide Replies</button>
      <button class="show-replies-btn">Show Replies</button>
    `;

    const voteBtns = subreplyElement.querySelectorAll(".vote-btn");
    voteBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const voteType = btn.dataset.vote;
        if (voteType === "up") {
          subreply.upvotes++;
        } else if (voteType === "down") {
          subreply.downvotes++;
        }

        updateVotesCount(subreplyElement, subreply.upvotes - subreply.downvotes);

        voteBtns.forEach((btn) => btn.classList.remove("upvoted", "downvoted"));
        if (subreply.upvotes > subreply.downvotes) {
          btn.classList.add("upvoted");
        } else if (subreply.upvotes < subreply.downvotes) {
          btn.classList.add("downvoted");
        }
      });
    });

    const replyBtn = subreplyElement.querySelector(".reply-btn");
    const closeBtn = subreplyElement.querySelector(".close-btn");
    const replyDropdown = subreplyElement.querySelector(".reply-dropdown");
    const replyInput = subreplyElement.querySelector(".reply-input");
    const submitReplyBtn = subreplyElement.querySelector(".submit-reply-btn");
    const repliesContainer = subreplyElement.querySelector(".replies");
    const showRepliesBtn = subreplyElement.querySelector(".show-replies-btn");
    const hideRepliesBtn = subreplyElement.querySelector(".hide-replies-btn");
    closeBtn.style.display = "none";

    replyBtn.addEventListener("click", () => {
      replyDropdown.style.display = "block";
      replyInput.style.display = "block";
      submitReplyBtn.style.display = "block";
      replyBtn.style.display = "none";
      closeBtn.style.display = "inline-block";
    });

    closeBtn.addEventListener("click", () => {
      replyDropdown.style.display = "none";
      replyInput.style.display = "none";
      submitReplyBtn.style.display = "none";
      replyBtn.style.display = "inline-block";
      closeBtn.style.display = "none";
    });

    submitReplyBtn.addEventListener("click", () => {
      const replyContent = replyInput.value;
      if (replyContent) {
        subreply.replies.push({
          id: Date.now(),
          content: replyContent,
          upvotes: 0,
          downvotes: 0,
          replies: []
        });
        replyInput.value = "";
        replyDropdown.style.display = "none";
        replyBtn.style.display = "inline-block";
        closeBtn.style.display = "none";
        renderSubreplies(subreply.replies, repliesContainer);
        repliesContainer.style.display = "block";
        hideRepliesBtn.style.display = "inline-block";
        showRepliesBtn.style.display = "none";
      }
    });

    hideRepliesBtn.addEventListener("click", () => {
      repliesContainer.style.display = "none";
      hideRepliesBtn.style.display = "none";
      showRepliesBtn.style.display = "inline-block";
    });

    showRepliesBtn.addEventListener("click", () => {
      repliesContainer.style.display = "block";
      hideRepliesBtn.style.display = "inline-block";
      showRepliesBtn.style.display = "none";
    });

    displayUserAddress(subreplyElement); // Display user address for the subreply
    parentElement.appendChild(subreplyElement);
    renderSubreplies(subreply.replies, repliesContainer);

    if (subreply.replies.length > 0) {
      hideRepliesBtn.style.display = "inline-block";
      showRepliesBtn.style.display = "none";
    } else {
      hideRepliesBtn.style.display = "none";
      showRepliesBtn.style.display = "none";
    }
  }
}




async function addComment() {
  const commentInput = document.getElementById("comment-input");
  const commentContent = commentInput.value;

  if (commentContent) {
    const userAddress = await getWalletAddress();
    if (userAddress) {
      commentsData.push({
        id: Date.now(),
        user: userAddress,
        content: commentContent,
        upvotes: 0,
        downvotes: 0,
        replies: []
      });
      commentInput.value = "";
      const commentsList = document.getElementById("comments-list");
      commentsList.innerHTML = "";
      renderComments(commentsData, commentsList);
    }
  }
}

const submitBtn = document.getElementById("submit-btn");
submitBtn.addEventListener("click", addComment);

const commentsList = document.getElementById("comments-list");
renderComments(commentsData, commentsList);
