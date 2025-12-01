## Never do any changes or look the code of oldstory folder

Got error messaeg ->
## Error Type
Runtime TypeError

## Error Message
Failed to fetch


    at handleQA (src/app/page.tsx:29:21)

## Code Frame
  27 |
  28 | const handleQA = async () => {
> 29 |   const res = await fetch("http://localhost:8000/qa", {
     |                     ^
  30 |     method: "POST",
  31 |     headers: { "Content-Type": "application/json" },
  32 |     body: JSON.stringify({ query: qaQuery }),

Next.js version: 15.5.2 (Turbopack)

terminal ->
INFO:     Will watch for changes in these directories: ['D:\\MeshMemory\\mesh-core\\backend']
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [7068] using StatReload
D:\MeshMemory\mesh-core\backend\main.py:14: LangChainDeprecationWarning: Importing Weaviate from langchain.vectorstores is deprecated. Please replace deprecated imports:

>> from langchain.vectorstores import Weaviate

with new imports of:

>> from langchain_community.vectorstores import Weaviate
You can use the langchain cli to **automatically** upgrade many imports. Please see documentation here <https://python.langchain.com/docs/versions/v0_2/>
  from langchain.vectorstores import Weaviate as LCWeaviate
Process SpawnProcess-1:
Traceback (most recent call last):
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\multiprocessing\process.py", line 314, in _bootstrap
    self.run()
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\multiprocessing\process.py", line 108, in run 
    self._target(*self._args, **self._kwargs)
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\_subprocess.py", line 80, in subprocess_started  
    target(sockets=sockets)
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\server.py", line 67, in run
    return asyncio.run(self.serve(sockets=sockets))
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\asyncio\runners.py", line 190, in run
    return runner.run(main)
           ^^^^^^^^^^^^^^^^
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\asyncio\runners.py", line 118, in run
    return self._loop.run_until_complete(task)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\asyncio\base_events.py", line 653, in run_until_complete
    return future.result()
           ^^^^^^^^^^^^^^^
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\server.py", line 71, in serve
    await self._serve(sockets)
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\server.py", line 78, in _serve
    config.load()
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\config.py", line 436, in load
    self.loaded_app = import_from_string(self.app)
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\uvicorn\importer.py", line 19, in import_from_string     
    module = importlib.import_module(module_str)
             ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "C:\Users\PRANAV PATIL\AppData\Local\Programs\Python\Python311\Lib\importlib\__init__.py", line 126, in import_module
    return _bootstrap._gcd_import(name[level:], package, level)
           ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "<frozen importlib._bootstrap>", line 1204, in _gcd_import
  File "<frozen importlib._bootstrap>", line 1176, in _find_and_load
  File "<frozen importlib._bootstrap>", line 1147, in _find_and_load_unlocked
  File "<frozen importlib._bootstrap>", line 690, in _load_unlocked
  File "<frozen importlib._bootstrap_external>", line 940, in exec_module
  File "<frozen importlib._bootstrap>", line 241, in _call_with_frames_removed
  File "D:\MeshMemory\mesh-core\backend\main.py", line 96, in <module>
    llm = ChatOpenAI(model="gpt-3.5-turbo", temperature=0, api_key=os.getenv("OPENAI_API_KEY"))
          ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\langchain_core\load\serializable.py", line 130, in __init__
    super().__init__(*args, **kwargs)
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\pydantic\main.py", line 253, in __init__
    validated_self = self.__pydantic_validator__.validate_python(data, self_instance=self)
                     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\langchain_openai\chat_models\base.py", line 792, in validate_environment
    self.root_client = openai.OpenAI(**client_params, **sync_specific)  # type: ignore[arg-type]
                       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  File "D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\openai\_client.py", line 135, in __init__
    raise OpenAIError(
openai.OpenAIError: The api_key client option must be set either by passing api_key to the client or by setting the OPENAI_API_KEY environment variable
D:\MeshMemory\mesh-core\backend\venv\Lib\site-packages\weaviate\warnings.py:302: ResourceWarning: Con004: The connection to Weaviate was not closed properly. This can lead to memory leaks.
            Please make sure to close the connection using `client.close()`.
  warnings.warn(
sys:1: ResourceWarning: unclosed <socket.socket fd=2328, family=23, type=1, proto=0, laddr=('::1', 60793, 0, 0), raddr=('::1', 8080, 0, 0)>
ResourceWarning: Enable tracemalloc to get the object allocation traceback