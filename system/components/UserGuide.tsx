const UserGuide = () => {
  return (
    <div className="container mx-auto p-6 bg-white shadow-lg">
      <h1 className="text-3xl font-bold mb-6">User Guide</h1>

      <div id="login" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. Login</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>When you first visit the platform, you will see a login dialog:</li>
          <li>Enter your username: Enter your username in the dialog box.</li>
          <li>Confirm login: Click the "Confirm" button to complete the login.</li>
        </ol>
      </div>

      <div id="start-chat" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. Start Chatting</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>View guidance: In the top guidance area, you will see instructions and suggestions for the current step.</li>
          <li>Enter your message: Type your question or request in the input box at the bottom.</li>
          <li>Send your message: Click the send button or press the enter key to send your message.</li>
        </ol>
      </div>

      <div id="generate-doc" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. Generate Document</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Initial interaction: The bot will ask about your game development needs. Please answer as detailed as possible.</li>
          <li>Document generation: Once the bot has collected enough information, it will generate an initial game development document and ask if you need any modifications.</li>
        </ol>
      </div>

      <div id="modify-doc" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. Modify and Improve Document</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>View document: Click to expand the document and view the details.</li>
          <li>Edit document: Click the edit button to modify the document content.</li>
          <li>Save changes: After completing the modifications, click the save button to save your changes.</li>
        </ol>
      </div>

      <div id="generate-code" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Generate Code</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Generate code: Click the "Generate Code" button, and the system will generate the corresponding Python code based on the document.</li>
          <li>View code: The generated code will be displayed in the code area of the page, and you can view and run it directly.</li>
        </ol>
      </div>

      <div id="other-functions" className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. Other Functions</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Evaluate document: Click the "Evaluate Doc" button, and the bot will assess whether your document is complete and correct, and provide suggestions.</li>
          <li>Return to previous step: If you need to modify previous steps, you can click the return button to re-edit.</li>
          <li>Reset: If you need to start over, you can click the reset button on the right side.</li>
        </ol>
      </div>

    </div>
  );
};

export default UserGuide;
