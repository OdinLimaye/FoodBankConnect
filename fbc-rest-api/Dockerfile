FROM public.ecr.aws/lambda/python:3.13
WORKDIR ${LAMBDA_TASK_ROOT}

# deps first (better caching)
COPY requirements.txt ./
RUN python -m pip install --no-cache-dir -r requirements.txt -t .

# your app
COPY app.py ./

# lambda handler
CMD ["app.lambda_handler"]
