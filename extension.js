let keydownHandler;

export default {
  onload: () => {
    // Ensure roamAlphaAPI is available
    if (!window.roamAlphaAPI) return;

    // Define the keyboard shortcut
    const shortcut = {
      key: "N",
      modifiers: ["ctrlKey", "shiftKey"],
    };

    // Function to create a new block, open it in the sidebar, and set focus
    async function createBlockAndFocus() {
      const todayDate = new Date();
      const dailyNoteUid = window.roamAlphaAPI.util.dateToPageUid(todayDate);

      // Generate a unique UID for the new block
      const blockUid = window.roamAlphaAPI.util.generateUID();

      // Create a new block in the daily note page
      await window.roamAlphaAPI.data.block.create({
        location: {
          "parent-uid": dailyNoteUid,
          order: "last",
        },
        block: {
          uid: blockUid,
          string: "", // New block content is empty
        },
      });

      // Open the block in the right sidebar
      await window.roamAlphaAPI.ui.rightSidebar.addWindow({
        window: {
          type: "block",
          "block-uid": blockUid,
        },
      });

      // Retrieve the newly created window's ID
      const windows = await window.roamAlphaAPI.ui.rightSidebar.getWindows();
      const newWindow = windows.find(
        (win) => win["type"] === "block" && win["block-uid"] === blockUid
      );

      if (newWindow) {
        // Focus the new block in the sidebar
        window.roamAlphaAPI.ui.setBlockFocusAndSelection({
          location: {
            "block-uid": blockUid,
            "window-id": newWindow["window-id"],
          },
        });
        console.log(
          "Block created, opened, and focused in the sidebar:", 
          blockUid
        );
      } else {
        console.error("Failed to find the window for the new block.");
      }
    }

    // Define the keydown handler
    keydownHandler = (event) => {
      if (
        event.key.toUpperCase() === shortcut.key &&
        shortcut.modifiers.every((mod) => event[mod])
      ) {
        event.preventDefault();
        createBlockAndFocus();
      }
    };

    // Start listening for the keyboard shortcut
    document.addEventListener("keydown", keydownHandler);
    console.log(
      "Roam Research extension loaded: Shortcut Ctrl+Shift+N to create, open, and focus block."
    );
  },

  onunload: () => {
    // Remove the event listener to clean up
    if (keydownHandler) {
      document.removeEventListener("keydown", keydownHandler);
      keydownHandler = null;
    }
  },
};
