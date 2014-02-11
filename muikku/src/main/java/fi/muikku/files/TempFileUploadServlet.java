package fi.muikku.files;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.ServletOutputStream;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;

import org.apache.commons.io.IOUtils;
import org.codehaus.jackson.map.ObjectMapper;

@MultipartConfig
@WebServlet("/tempFileUploadServlet")
public class TempFileUploadServlet extends HttpServlet {

  private static final long serialVersionUID = -4689635910226270913L;

  @Override
  protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
    Part file = req.getPart("file");
    
    File tempFile = TempFileUtils.createTempFile();
    FileOutputStream fileOutputStream = new FileOutputStream(tempFile);
    try {
      IOUtils.copy(file.getInputStream(), fileOutputStream);
    } finally {
      fileOutputStream.flush();
      fileOutputStream.close();
    }
    
    Map<String, String> output = new HashMap<>();
    output.put("fileId", tempFile.getName());
    
    resp.setContentType("application/json");
    ServletOutputStream servletOutputStream = resp.getOutputStream();
    try {
      (new ObjectMapper()).writeValue(servletOutputStream, output);
    } finally {
      servletOutputStream.flush();
    }
  }
  
}